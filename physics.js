"use strict";

window.DensityPhysics = (() => {
  const gravity = 9.82;

  function getObjectState(object, liquid) {
    const densityRatio = object.densityKgM3 / liquid.densityKgM3;
    const submergedFraction = Math.min(1, densityRatio);
    const floats = densityRatio < 1;
    const volumeM3 = object.volumeCm3 / 1_000_000;
    const massKg = object.densityKgM3 * volumeM3;

    return {
      floats,
      sinks: densityRatio > 1,
      submergedFraction,
      displacedVolumeMl: object.volumeCm3 * submergedFraction,
      massKg,
      weightN: massKg * gravity
    };
  }

  function getMeasurements(liquid, liquidVolumeMl, object, capacityMl) {
    const liquidMassKg = liquid
      ? liquid.densityKgM3 * (liquidVolumeMl / 1_000_000)
      : 0;
    const objectMassKg = object
      ? object.densityKgM3 * (object.volumeCm3 / 1_000_000)
      : 0;
    const objectState = liquid && object ? getObjectState(object, liquid) : null;
    const displacedVolumeMl = objectState ? objectState.displacedVolumeMl : 0;
    const volumeMl = Math.min(capacityMl, liquidVolumeMl + displacedVolumeMl);
    const totalWeightN = (liquidMassKg + objectMassKg) * gravity;

    return {
      volumeMl,
      massKg: totalWeightN / gravity,
      densityKgM3: liquid ? liquid.densityKgM3 : null,
      objectState
    };
  }

  return { gravity, getObjectState, getMeasurements };
})();
