import ffmpeg from 'fluent-ffmpeg';

/**
 * Analyse une vidéo et retourne une série de points temps => mouvement / volume.
 * Pour l'instant, la fonction est un squelette qui renvoie un tableau vide.
 * On remplira la logique FFmpeg étape par étape.
 *
 * @param {string} sourceUrl - URL de la vidéo source (Cloudinary ou /uploads).
 * @param {object} options
 * @param {number} options.stepSeconds - Intervalle d'échantillonnage (ex: 0.5s).
 */
export async function analyzeVideoMotionAndVolume(sourceUrl, { stepSeconds = 0.5 } = {}) {
  if (!sourceUrl) {
    throw new Error('sourceUrl est requis pour analyzeVideoMotionAndVolume');
  }

  // Implémentation initiale basée sur l'analyse du volume audio via astats.
  // Remarque : on met motion=0 pour l'instant, on pourra enrichir avec une
  // vraie analyse vidéo plus tard.

  const points = [];
  const resetSeconds = Math.max(0.2, Number(stepSeconds) || 0.5);

  return new Promise((resolve, reject) => {
    let currentTime = 0;
    const debugLines = [];

    const command = ffmpeg(sourceUrl)
      .noVideo()
      .audioFilters(`astats=metadata=1:reset=${resetSeconds}`)
      .format('null')
      .output('-')
      .on('stderr', (line) => {
        const text = line?.toString();
        if (!text) return;

        // Conserver quelques lignes pour debug si besoin
        const clean = text.trim();
        if (clean) {
          debugLines.push(clean);
          if (debugLines.length > 30) {
            debugLines.shift();
          }
        }

        // On cherche les lignes contenant "Overall.RMS_level"
        if (text.includes('Overall.RMS_level')) {
          const match = text.match(/Overall\.RMS_level:\s*(-?\d+(\.\d+)?)/);
          if (match) {
            const db = parseFloat(match[1]);
            // Convertir dB en valeur linéaire approximative (0..1)
            const volume = Number.isFinite(db) ? Math.pow(10, db / 20) : 0;
            currentTime += resetSeconds;
            points.push({
              t: currentTime,
              motion: 0,
              volume: Math.max(0, volume)
            });
          }
        }
      })
      .on('end', () => {
        if (!points.length && debugLines.length) {
          console.log('[highlightScoring] astats stderr sample:', debugLines.slice(-10));
        }
        resolve(points);
      })
      .on('error', (err) => {
        if (debugLines.length) {
          console.error('[highlightScoring] astats error, stderr sample:', debugLines.slice(-10));
        }
        reject(err);
      });

    command.run();
  });
}

/**
 * À partir des points mouvement/volume, construit des segments "highlights".
 *
 * @param {Array<{t:number,motion:number,volume:number}>} points
 * @param {number} targetDuration - Durée cible totale du montage (en secondes).
 */
export function buildHighlightSegments(points, targetDuration) {
  if (!Array.isArray(points) || points.length === 0) {
    return [];
  }

  const duration = Math.max(5, Number(targetDuration) || 30);

  // 1) Calculer un score pour chaque point
  const alpha = 0.7; // poids du mouvement
  const beta = 0.3; // poids du volume
  const scoredPoints = points.map((p) => {
    const motion = Number.isFinite(p.motion) ? Math.max(0, p.motion) : 0;
    const volume = Number.isFinite(p.volume) ? Math.max(0, p.volume) : 0;
    const score = alpha * motion + beta * volume;
    return {
      t: Number.isFinite(p.t) ? p.t : 0,
      motion,
      volume,
      score
    };
  });

  // 2) Regrouper en fenêtres de 1s
  const windowSize = 1; // seconde
  const windows = new Map();

  for (const p of scoredPoints) {
    const key = Math.floor(p.t / windowSize);
    if (!windows.has(key)) {
      windows.set(key, { start: key * windowSize, motion: 0, volume: 0, score: 0, count: 0 });
    }
    const w = windows.get(key);
    w.motion += p.motion;
    w.volume += p.volume;
    w.score += p.score;
    w.count += 1;
  }

  const windowSegments = Array.from(windows.values()).map((w) => {
    const count = w.count || 1;
    return {
      start: w.start,
      duration: windowSize,
      score: w.score / count
    };
  });

  // 3) Trier par score décroissant
  windowSegments.sort((a, b) => b.score - a.score);

  // 4) Sélectionner les meilleurs segments jusqu'à couvrir ~duration secondes
  const selected = [];
  let accumulated = 0;

  for (const seg of windowSegments) {
    if (accumulated >= duration) break;
    // éviter les segments à score quasi nul
    if (!Number.isFinite(seg.score) || seg.score <= 0) continue;

    const remaining = duration - accumulated;
    const clipDuration = Math.min(seg.duration, remaining);

    selected.push({
      start: seg.start,
      duration: clipDuration,
      score: seg.score
    });

    accumulated += clipDuration;
  }

  return selected;
}


/**
 * Fonction utilitaire haut-niveau: prend une vidéo et renvoie les meilleurs moments.
 *
 * @param {string} sourceUrl
 * @param {number} targetDuration
 */
export async function scoreVideoHighlights(sourceUrl, targetDuration) {
  const points = await analyzeVideoMotionAndVolume(sourceUrl, { stepSeconds: 0.5 });
  return buildHighlightSegments(points, targetDuration);
}


