import crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';

function visionProviderConfigured() {
  return Boolean(process.env.VISION_API_URL && process.env.VISION_API_KEY);
}

export async function analyzeSourceVideo({
  sourceVideo,
  targetDuration = 30
}) {
  if (!sourceVideo?.url) {
    return [];
  }

  if (visionProviderConfigured()) {
    const scenes = await callExternalVisionApi(sourceVideo, targetDuration);
    if (scenes.length) {
      return scenes;
    }
  }

  return fallbackSceneDetection(sourceVideo, targetDuration);
}

async function callExternalVisionApi(sourceVideo, targetDuration) {
  try {
    const response = await fetch(process.env.VISION_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VISION_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_url: sourceVideo.public_url || sourceVideo.url,
        target_duration: targetDuration
      })
    });

    if (!response.ok) {
      console.error(
        'Vision API error:',
        response.status,
        await response.text()
      );
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data?.scenes)) {
      return [];
    }

    const plan = [];
    let accumulated = 0;
    for (const scene of data.scenes) {
      if (accumulated >= targetDuration) break;
      const start = Math.max(0, Number(scene.start) || 0);
      const end = Math.max(start + 1, Number(scene.end) || start + 4);
      const duration = Math.min(end - start, targetDuration - accumulated, 12);
      plan.push({
        id: scene.id || `vision-${plan.length}`,
        url: scene.url || sourceVideo.public_url || sourceVideo.url,
        label: scene.label || scene.category || 'scene',
        confidence: scene.confidence || 0.5,
        start,
        requestedDuration: Number(duration.toFixed(2))
      });
      accumulated += duration;
    }
    return plan;
  } catch (error) {
    console.error('Vision API call failed:', error.message);
    return [];
  }
}

async function fallbackSceneDetection(sourceVideo, targetDuration) {
  const url = sourceVideo.public_url || sourceVideo.url;
  const duration =
    Number(sourceVideo.duration) ||
    (await probeVideoDuration(url)) ||
    targetDuration;

  const clipDuration = Math.min(10, targetDuration / 5);
  const plan = [];
  let cursor = 0;
  let accumulated = 0;

  while (cursor < duration && accumulated < targetDuration) {
    const segmentDuration = Math.min(
      clipDuration,
      duration - cursor,
      targetDuration - accumulated
    );
    plan.push({
      id: `fallback-${plan.length}`,
      url,
      label: 'auto-scene',
      start: Number(cursor.toFixed(2)),
      requestedDuration: Number(segmentDuration.toFixed(2))
    });
    cursor += clipDuration * 1.1;
    accumulated += segmentDuration;
  }

  if (!plan.length) {
    plan.push({
      id: `fallback-0`,
      url,
      label: 'full',
      start: 0,
      requestedDuration: Math.min(targetDuration, duration)
    });
  }

  return plan;
}

function probeVideoDuration(url) {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(url, (error, metadata) => {
      if (error) {
        console.warn('ffprobe duration failed:', error.message);
        return resolve(null);
      }
      resolve(Number(metadata?.format?.duration) || null);
    });
  });
}

