
"use strict";

(function () {
  const KEY = "em_motor";

  const M = store.get(KEY, {
    type: "dc",
    W: 500,
    V: 12,
    PF: 0.85,
    eff: 85,
    startMult: 3,
    batteryV: 12,
    hours: 2
  });

  registerModule({
    id: "motor",
    titleKey: "motor",
    subKey: "motorS",

    render() {
      return `
        ${topBar(t("motor"))}

        <div id="motorOut"></div>

        <div class="lab">${t("motorType")}</div>
        <div class="chips">
          ${chip("data-ftype", "dc", "DC", M.type === "dc")}
          ${chip("data-ftype", "single", "AC 1φ", M.type === "single")}
          ${chip("data-ftype", "three", "AC 3φ", M.type === "three")}
        </div>

        <div class="fields two">
          ${field("mW", t("motorW"), M.W)}
          ${field("mV", "Supply voltage (V)", M.V)}
          ${field("mPF", t("motorPF"), M.PF)}
          ${field("mEff", t("eff") + " (%)", M.eff)}
          ${field("mStart", t("startMult"), M.startMult)}
          ${field("mHours", t("runHours"), M.hours)}
        </div>

        <div class="lab">${t("batteryForMotor")}</div>
        <div class="fields two">
          ${field("mBatteryV", t("batteryV"), M.batteryV)}
        </div>

        <div class="actions">
          <button class="save" id="save">${t("save")}</button>
        </div>

        <div class="note">${t("motorNote")}</div>
      `;
    },

    update() {
      const get = id => document.getElementById(id);
      if (!get("mW")) return;

      M.W = num(get("mW").value);
      M.V = num(get("mV").value);
      M.PF = num(get("mPF").value);
      M.eff = num(get("mEff").value);
      M.startMult = num(get("mStart").value);
      M.hours = num(get("mHours").value);
      M.batteryV = num(get("mBatteryV").value);

      store.set(KEY, M);

      const out = get("motorOut");

      const valid =
        [M.W, M.V, M.PF, M.eff, M.startMult, M.hours, M.batteryV]
          .every(Number.isFinite) &&
        M.W > 0 &&
        M.V > 0 &&
        M.PF > 0 &&
        M.PF <= 1 &&
        M.eff > 0 &&
        M.eff <= 100 &&
        M.startMult >= 1 &&
        M.hours > 0 &&
        M.batteryV > 0;

      if (!valid) {
        App.last = null;
        out.innerHTML = `
          <div class="res bad">
            <div class="d">${t("bad")}</div>
          </div>`;
        return;
      }

      const efficiency = M.eff / 100;
      let current;

      if (M.type === "dc") {
        current = M.W / (M.V * efficiency);
      } else if (M.type === "single") {
        current = M.W / (M.V * M.PF * efficiency);
      } else {
        current = M.W / (Math.sqrt(3) * M.V * M.PF * efficiency);
      }

      const startCurrent = current * M.startMult;
      const energyWh = M.W * M.hours;

      // Approximate battery sizing: includes 85% inverter efficiency.
      const batteryAh = energyWh / (M.batteryV * 0.85 * 0.85);

      const n = x => fmt(x, 2);

      const typeLabel =
        M.type === "dc" ? "DC" :
        M.type === "single" ? "AC 1φ" : "AC 3φ";

      App.last = {
        title: `${t("motor")} · ${M.W} W · ${typeLabel}`,
        result:
          `${t("runningCurrent")}: ${n(current)} A; ` +
          `${t("startCurrent")}: ${n(startCurrent)} A`
      };

      out.innerHTML = `
        <div class="res">
          <div class="l">${t("runningCurrent")}</div>
          <div class="n">${n(current)} A</div>
          <div class="d">${M.W} W · ${M.V} V · ${typeLabel}</div>
        </div>

        <div class="res">
          <div class="l">${t("startCurrent")} ${t("startEstimate")}</div>
          <div class="n">${n(startCurrent)} A</div>
          <div class="d">${t("startMult")}: ${n(M.startMult)}×</div>
        </div>

        <div class="res">
          <div class="l">${t("energyUsed")}</div>
          <div class="n">${n(energyWh)} Wh</div>
          <div class="d">${t("runHours")}: ${n(M.hours)}</div>
        </div>

        <div class="res">
          <div class="l">${t("batteryNeeded")}</div>
          <div class="n">${n(batteryAh)} Ah</div>
          <div class="d">${M.batteryV} V · ${t("batteryEstimate")}</div>
        </div>
      `;
    },

    click(el) {
      if (el.dataset.ftype) {
        if (!["dc", "single", "three"].includes(el.dataset.ftype)) {
          return false;
        }

        M.type = el.dataset.ftype;
        setOn("[data-ftype]", el);
        this.update();
        return true;
      }

      return false;
    }
  });
})();
