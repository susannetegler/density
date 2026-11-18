"use strict";

(() => {
  const errorMessage = document.querySelector("#error-message");

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
  }

  fetch("content.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`content.json kunde inte laddas (HTTP ${response.status}).`);
      }
      return response.json();
    })
    .then(startApp)
    .catch((error) => {
      console.error("Simuleringen kunde inte starta.", error);
      showError("Simuleringen kunde inte starta. Öppna sidan via en lokal webbserver och kontrollera att content.json finns.");
    });

  function startApp(content) {
    const resetButton = document.querySelector("#reset-button");
    const liquidList = document.querySelector("#liquid-list");
    const objectList = document.querySelector("#object-list");
    const tank = document.querySelector("#tank");
    const graduations = document.querySelector("#graduations");
    const liquid = document.querySelector("#liquid");
    const liquidSurface = document.querySelector("#liquid-surface");
    const placedObject = document.querySelector("#placed-object");
    const massReading = document.querySelector("#mass-reading");
    const volumeReading = document.querySelector("#volume-reading");
    const densityReading = document.querySelector("#density-reading");
    const resultMessage = document.querySelector("#result-message");
    const dropHint = document.querySelector("#drop-hint");

    const state = {
      liquidId: "",
      liquidVolumeMl: 0,
      objectId: ""
    };

    const intervalsPerMajorMark = 6;
    const majorMarkCount = content.vesselCapacityMl / 100;
    const totalIntervals = majorMarkCount * intervalsPerMajorMark;
    for (let index = 0; index <= totalIntervals; index += 1) {
      const tick = document.createElement("span");
      const isMajor = index % intervalsPerMajorMark === 0;
      const isZero = index === totalIntervals;
      tick.className = `graduation${isMajor ? " is-major" : ""}${isZero ? " is-zero" : ""}`;
      tick.style.top = `${(index / totalIntervals) * 100}%`;
      if (isMajor) {
        const label = document.createElement("span");
        label.className = "graduation-label";
        label.textContent = String(content.vesselCapacityMl - (index / intervalsPerMajorMark) * 100);
        tick.append(label);
      }
      graduations.append(tick);
    }

    for (const fluid of content.liquids) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "liquid-card";
      card.dataset.liquidId = fluid.id;
      card.setAttribute("aria-pressed", "false");

      const swatch = document.createElement("span");
      swatch.className = "liquid-swatch";
      swatch.style.backgroundColor = fluid.color;
      swatch.setAttribute("aria-hidden", "true");

      const details = document.createElement("span");
      details.className = "choice-details";
      const name = document.createElement("strong");
      name.textContent = fluid.name;
      const density = document.createElement("small");
      density.textContent = formatDensity(fluid.densityKgM3);
      details.append(name, density);

      const action = document.createElement("span");
      action.className = "card-action";
      action.textContent = "Lägg i";
      card.append(swatch, details, action);
      card.addEventListener("click", () => toggleLiquid(fluid.id));
      liquidList.append(card);
    }

    for (const object of content.objects) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "object-card";
      card.dataset.objectId = object.id;
      card.setAttribute("aria-pressed", "false");
      card.innerHTML = `${makeObjectIcon(object.shape)}<span class="choice-details"><strong>${object.name}</strong></span><span class="card-action">Lägg i</span>`;
      card.addEventListener("click", () => toggleObject(object.id));
      objectList.append(card);
    }

    document.querySelector("#explanation-content").innerHTML = content.modelText
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");

    resetButton.addEventListener("click", () => {
      state.liquidId = "";
      state.liquidVolumeMl = 0;
      state.objectId = "";
      render();
    });

    function toggleLiquid(liquidId) {
      if (state.liquidId === liquidId) {
        state.liquidId = "";
        state.liquidVolumeMl = 0;
      } else {
        state.liquidId = liquidId;
        state.liquidVolumeMl = content.initialVolumeMl;
      }
      render();
    }

    function toggleObject(objectId) {
      state.objectId = state.objectId === objectId ? "" : objectId;
      render();
    }

    function render() {
      const selectedLiquid = content.liquids.find((item) => item.id === state.liquidId);
      const selectedObject = content.objects.find((item) => item.id === state.objectId);
      const measurements = DensityPhysics.getMeasurements(
        selectedLiquid,
        state.liquidVolumeMl,
        selectedObject,
        content.vesselCapacityMl
      );

      liquid.style.height = `${(measurements.volumeMl / content.vesselCapacityMl) * 94.5}%`;
      liquidSurface.style.bottom = `calc(0.5% + ${(measurements.volumeMl / content.vesselCapacityMl) * 94.5}% - 2px)`;
      liquidSurface.hidden = !state.liquidVolumeMl;
      liquid.style.backgroundColor = selectedLiquid ? selectedLiquid.color : "transparent";
      liquidSurface.style.backgroundColor = selectedLiquid ? selectedLiquid.color : "transparent";
      tank.setAttribute(
        "aria-label",
        selectedLiquid && state.liquidVolumeMl
          ? `Mätbägare med ${selectedLiquid.name.toLowerCase()}${selectedObject ? ` och ${selectedObject.name.toLowerCase()}` : ""}`
          : selectedObject
            ? `Tom mätbägare med ${selectedObject.name.toLowerCase()}`
            : "Tom graderad mätbägare"
      );

      massReading.textContent = formatNumber(measurements.massKg, 3);
      volumeReading.innerHTML = `${formatNumber(measurements.volumeMl, 0)} <small>mL</small>`;
      densityReading.textContent = selectedLiquid ? formatDensity(selectedLiquid.densityKgM3) : "–";
      dropHint.textContent = selectedLiquid && selectedObject
        ? "Tryck på en aktiv knapp för att ta bort"
        : selectedLiquid
          ? "Välj ett föremål eller tryck på vätskan igen för att ta bort den"
          : selectedObject
            ? "Välj en vätska eller tryck på föremålet igen för att ta upp det"
            : "Tryck på en vätska eller ett föremål";

      for (const card of liquidList.querySelectorAll(".liquid-card")) {
        const active = card.dataset.liquidId === state.liquidId;
        card.classList.toggle("is-in-vessel", active);
        card.setAttribute("aria-pressed", String(active));
        card.querySelector(".card-action").textContent = active
          ? "Ta bort"
          : state.liquidId
            ? "Byt"
            : "Lägg i";
      }

      for (const card of objectList.querySelectorAll(".object-card")) {
        const active = card.dataset.objectId === state.objectId;
        card.classList.toggle("is-in-vessel", active);
        card.setAttribute("aria-pressed", String(active));
        card.querySelector(".card-action").textContent = active ? "Ta bort" : "Lägg i";
      }

      if (!selectedObject) {
        placedObject.hidden = true;
        resultMessage.textContent = selectedLiquid
          ? `${selectedLiquid.name} är i bägaren. Tryck på ett föremål för att lägga i det.`
          : "Bägaren är tom. Välj en vätska eller ett föremål.";
        return;
      }

      placedObject.hidden = false;
      placedObject.className = `placed-object shape-${selectedObject.shape}`;
      placedObject.setAttribute("aria-label", selectedObject.name);
      placeObject(
        selectedObject,
        measurements.objectState,
        measurements.volumeMl,
        Boolean(state.liquidVolumeMl)
      );

      if (!selectedLiquid || !measurements.objectState) {
        resultMessage.textContent = `${selectedObject.name} ligger i bägaren utan vätska. Avläst volym: 0 mL.`;
      } else {
        const behavior = measurements.objectState.floats
          ? "flyter"
          : measurements.objectState.sinks
            ? "sjunker"
            : "svävar neutralt";
        const percent = Math.round(measurements.objectState.submergedFraction * 100);
        resultMessage.textContent = `${selectedObject.name} ${behavior} i ${selectedLiquid.name.toLowerCase()}. ${percent} % av föremålets volym är under ytan.`;
      }
    }

    function placeObject(object, objectState, volumeMl, hasLiquid) {
      const tankHeight = tank.clientHeight;
      const volumeRatio = Math.cbrt(object.volumeCm3 / 500);
      const size = Math.max(30, Math.min(66, 54 * volumeRatio));
      const bottom = tankHeight * 0.995;
      const liquidHeight = tankHeight * 0.945 * (volumeMl / content.vesselCapacityMl);
      const surface = bottom - liquidHeight;
      let top;
      if (!hasLiquid) {
        top = bottom - size - 5;
      } else if (objectState.floats) {
        const depthRatio = object.shape === "wood"
          ? objectState.submergedFraction
          : fractionToDepthRatio(objectState.submergedFraction);
        top = surface - size + size * depthRatio;
      } else if (objectState.sinks) {
        top = bottom - size - 5;
      } else {
        top = surface + liquidHeight / 2 - size / 2;
      }
      placedObject.style.width = `${size}px`;
      placedObject.style.height = `${size}px`;
      placedObject.style.left = "50%";
      placedObject.style.top = `${Math.max(4, Math.min(tankHeight - size - 4, top))}px`;
    }

    function fractionToDepthRatio(fraction) {
      let low = 0;
      let high = 1;
      for (let iteration = 0; iteration < 24; iteration += 1) {
        const middle = (low + high) / 2;
        const submergedVolume = middle * middle * (3 - 2 * middle);
        if (submergedVolume < fraction) low = middle;
        else high = middle;
      }
      return (low + high) / 2;
    }

    render();
  }

  function formatDensity(densityKgM3) {
    return `${formatNumber(densityKgM3 / 1000, 3)} kg/L`;
  }

  function formatNumber(value, decimals) {
    return new Intl.NumberFormat("sv-SE", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  function makeObjectIcon(shape) {
    if (shape === "beach-ball") {
      return '<span class="object-icon icon-beach-ball" aria-hidden="true"></span>';
    }
    if (shape === "stone") {
      return '<span class="object-icon icon-stone" aria-hidden="true"></span>';
    }
    if (shape === "wood") {
      return '<span class="object-icon icon-wood" aria-hidden="true"></span>';
    }
    return `<span class="object-icon icon-sphere icon-${shape}" aria-hidden="true"></span>`;
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }
})();
