"use strict";
(function () {
  const M = store.get("em_motor", {
    type: "dc",
    V: 12,
    W: 240,
    eff: 85,
    pf: 0.85,
    start: 3,
    hours: 2,
    battV: 12,
    dod: 80
  });

  registerModule({
    id: "motor",
    titleKey: "motor",
    subKey: "motorS",

    render() {
      return `${topBar(t("motor"))}
        <div id="motorOut"></div>

        <div class="lab">${t("motorType")}</div>
        <div class="chips">
          ${[
            ["dc", "DC"],
            ["ac1", "1 Phase AC"],
            ["ac3", "3 Phase AC"]
          ].map(([v, label]) =>
            chip("data-act", "type-" + v, label, M.type === v)
          ).join("")}
        </div>

        <div class="fields">
          ${field("mV", t("V"), M.V)}
          ${field("mW", t("motorW"), M.W)}
          ${field("mEff", t("eff"), M.eff)}
          ${M.type === "dc" ? "" : field("mPF", t("motorPF"), M.pf)}
          ${field("mStart", t("startMult"), M.start)}
        </div>

        <div class="lab">${t("batteryForMotor")}</div>
        <div class="fields">
          ${field("mBattV", t("batteryV"), M.battV)}
          ${field("mHours", t("runHours"), M.hours)}
          ${field("mDod", t("dod"), M.dod)}
        </div>

        <div class="actions">
          <button class="save" id="save">${t("save")}</button>
        </div>
        <div class="note">${t("motorNote")}</div>`;
    },

    update() {
      const get = id => document.getElementById(id);

      if (get("mV")) {
        M.V = num(get("mV").value);
        M.W = num(get("mW").value);
        M.eff = num(get("mEff").value);
        M.start = num(get("mStart").value);
        M.battV = num(get("mBattV").value);
        M.hours = num(get("mHours").value);
        M.dod = num(get("mDod").value);
        if (get("mPF")) M.pf = num(get("mPF").value);
        store.set("em_motor", M);
      }

      const valid = [
        M.V, M.W, M.eff, M.start, M.battV, M.hours, M.dod
      ].every(Number.isFinite) &&
        M.V > 0 && M.W > 0 &&
        M.eff > 0 && M.eff <= 100 &&
        M.start >= 1 && M.start <= 10 &&
        M.battV > 0 && M.hours > 0 &&
        M.dod > 0 && M.dod <= 100 &&
        (M.type === "dc" || (M.pf > 0 && M.pf <= 1));

      if (!valid) {
        App.last = null;
        get("motorOut").innerHTML =
          `<div class="res bad"><div class="d">${t("bad")}</div></div>`;
        return;
      }

      const e = M.eff / 100;
      let amps;

      if (M.type === "dc") {
        amps = M.W / (M.V * e);
      } else if (M.type === "ac1") {
        amps = M.W / (M.V * e * M.pf);
      } else {
        amps = M.W / (Math.sqrt(3) * M.V * e * M.pf);
      }

      const startA = amps * M.start;
      const wh = M.W * M.hours;
      const ah = wh / (M.battV * (M.dod / 100) * e);
      const kwh = wh / 1000;

      const n = x => fmt(x, 1);
      const result = `${t("cur")}: ${n(amps)} A · ${t("startCurrent")}: ${n(startA)} A`;

      App.last = {
        title: `${t("motor")} · ${M.W} W / ${M.V} V`,
        result: `${n(amps)} A; ${t("batteryAh")}: ${n(ah)} Ah`
      };

      get("motorOut").innerHTML = `
        <div class="res">
          <div class="l">${t("runningCurrent")}</div>
          <div class="n">${n(amps)} A</div>
          <div class="d">${t("startCurrent")}: ${n(startA)} A ${t("startEstimate")}</div>
        </div>
        <div class="res">
          <div class="l">${t("energyUsed")}</div>
          <div class="n">${n(kwh)} kWh</div>
          <div class="d">${t("runHours")}: ${n(M.hours)} h · ${n(wh)} Wh</div>
        </div>
        <div class="res">
          <div class="l">${t("batteryNeeded")}</div>
          <div class="n">${n(ah)} Ah</div>
          <div class="d">${M.battV} V · ${t("batteryEstimate")}</div>
        </div>`;
    },

    click(el) {
      if (el.dataset.act && el.dataset.act.startsWith("type-")) {
        M.type = el.dataset.act.slice(5);
        render();
        return true;
      }
      return false;
    }
  });
})();
