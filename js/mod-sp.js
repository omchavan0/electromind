
"use strict";

(function () {
  const KEY = "em_bpro";

  const B = store.get(KEY, {
    V: 12,
    Ah: 100,
    loadA: 10,
    hours: 5,
    dod: 50,
    eff: 85,
    chargeA: 10,
    chem: "lead"
  });

  registerModule({
    id: "battery",
    titleKey: "batteryPro",
    subKey: "batteryProS",

    render() {
      return `
        ${topBar(t("batteryPro"))}

        <div id="batteryOut"></div>

        <div class="lab">${t("batteryV")}</div>
        <div class="chips">
          ${[12, 24, 48].map(v =>
            chip("data-v", v, v + "V", B.V === v)
          ).join("")}
        </div>

        <div class="lab">${t("chem")}</div>
        <div class="chips">
          ${["lead", "agm", "lfp"].map(c =>
            chip("data-chem", c, t(c), B.chem === c)
          ).join("")}
        </div>

        <div class="fields two">
          ${field("bAh", t("Ah"), B.Ah)}
          ${field("bLoadA", t("loadCurrent"), B.loadA)}
          ${field("bHours", t("runHours"), B.hours)}
          ${field("bDod", t("dod"), B.dod)}
          ${field("bEff", t("eff"), B.eff)}
          ${field("bCharge", t("chargeCurrent"), B.chargeA)}
        </div>

        <div class="actions">
          <button class="save" id="save">${t("save")}</button>
        </div>

        <div class="note">${t("batteryNote")}</div>
      `;
    },

    update() {
      const get = id => document.getElementById(id);
      const out = get("batteryOut");

      if (!out) return;

      if (get("bAh")) {
        B.Ah = num(get("bAh").value);
        B.loadA = num(get("bLoadA").value);
        B.hours = num(get("bHours").value);
        B.dod = num(get("bDod").value);
        B.eff = num(get("bEff").value);
        B.chargeA = num(get("bCharge").value);

        store.set(KEY, B);
      }

      const valid = [
        B.V, B.Ah, B.loadA, B.hours,
        B.dod, B.eff, B.chargeA
      ].every(Number.isFinite) &&
        B.V > 0 &&
        B.Ah > 0 &&
        B.loadA > 0 &&
        B.hours > 0 &&
        B.dod > 0 && B.dod <= 100 &&
        B.eff > 0 && B.eff <= 100 &&
        B.chargeA > 0;

      if (!valid) {
        App.last = null;
        out.innerHTML = `
          <div class="res bad">
            <div class="d">${t("bad")}</div>
          </div>`;
        return;
      }

      // Usable capacity and estimated backup
      const usableAh = B.Ah * (B.dod / 100) * (B.eff / 100);
      const backupHours = usableAh / B.loadA;

      // Battery capacity required for target backup
      const requiredAh =
        (B.loadA * B.hours) /
        ((B.dod / 100) * (B.eff / 100));

      // Approximate charging time; actual time depends on charger and battery
      const chargeHours = (B.Ah * 1.2) / B.chargeA;

      const n = value => fmt(value, 1);

      // Avoid displaying "60 minutes" after rounding
      const totalMinutes = Math.round(backupHours * 60);
      const wholeHours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;

      const backupText =
        `${digits(wholeHours)} ${t("hr")} ` +
        `${digits(remainingMinutes)} ${t("mn")}`;

      App.last = {
        title: `${t("batteryPro")} · ${B.V}V ${B.Ah}Ah`,
        result:
          `${t("backup")}: ${backupText}; ` +
          `${t("requiredAh")}: ${n(requiredAh)} Ah`
      };

      out.innerHTML = `
        <div class="res">
          <div class="l">${t("backup")}</div>
          <div class="n">${backupText}</div>
          <div class="d">
            ${t("loadCurrent")}: ${n(B.loadA)} A
            · ${B.V} V
          </div>
        </div>

        <div class="res">
          <div class="l">${t("requiredAh")}</div>
          <div class="n">${n(requiredAh)} Ah</div>
          <div class="d">
            ${t("targetBackup")}: ${n(B.hours)} h
          </div>
        </div>

        <div class="res">
          <div class="l">${t("chargeTime")}</div>
          <div class="n">${n(chargeHours)} h</div>
          <div class="d">
            ${t("chargeCurrent")}: ${n(B.chargeA)} A
          </div>
        </div>
      `;
    },

    click(el) {
      if (el.dataset.v) {
        B.V = Number(el.dataset.v);
        store.set(KEY, B);
        setOn("[data-v]", el);
        this.update();
        return true;
      }

      if (el.dataset.chem) {
        const chemistry = el.dataset.chem;

        if (!["lead", "agm", "lfp"].includes(chemistry)) {
          return false;
        }

        B.chem = chemistry;

        const defaults = CHEM[B.chem];

        if (defaults) {
          B.dod = defaults.dod;
          B.eff = defaults.eff;
        }

        const dodInput = document.getElementById("bDod");
        const effInput = document.getElementById("bEff");

        if (dodInput) dodInput.value = B.dod;
        if (effInput) effInput.value = B.eff;

        store.set(KEY, B);
        setOn("[data-chem]", el);
        this.update();
        return true;
      }

      return false;
    }
  });
})();
