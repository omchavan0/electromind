"use strict";
(function () {
  const B = store.get("em_bpro", {
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
      return `${topBar(t("batteryPro"))}
        <div id="batteryOut"></div>

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

        <div class="fields">
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
        <div class="note">${t("batteryNote")}</div>`;
    },

    update() {
      const get = id => document.getElementById(id);

      if (get("bAh")) {
        B.Ah = num(get("bAh").value);
        B.loadA = num(get("bLoadA").value);
        B.hours = num(get("bHours").value);
        B.dod = num(get("bDod").value);
        B.eff = num(get("bEff").value);
        B.chargeA = num(get("bCharge").value);
        store.set("em_bpro", B);
      }

      const valid = [
        B.V, B.Ah, B.loadA, B.hours, B.dod, B.eff, B.chargeA
      ].every(Number.isFinite) &&
        B.V > 0 && B.Ah > 0 && B.loadA > 0 &&
        B.hours > 0 && B.dod > 0 && B.dod <= 100 &&
        B.eff > 0 && B.eff <= 100 && B.chargeA > 0;

      if (!valid) {
        App.last = null;
        get("batteryOut").innerHTML =
          `<div class="res bad"><div class="d">${t("bad")}</div></div>`;
        return;
      }

      const factor = (B.dod / 100) * (B.eff / 100);
      const availableAh = B.Ah * factor;
      const backupH = availableAh / B.loadA;
      const requiredAh = (B.loadA * B.hours) / factor;
      const chargeHours = (B.Ah * 1.2) / B.chargeA;
      const n = x => fmt(x, 1);

      const bh = Math.floor(backupH);
      const bm = Math.round((backupH - bh) * 60);
      const backupText = `${digits(bh)} ${t("hr")} ${digits(bm)} ${t("mn")}`;

      App.last = {
        title: `${t("batteryPro")} · ${B.V}V ${B.Ah}Ah`,
        result: `${t("backup")}: ${backupText}; ${t("requiredAh")}: ${n(requiredAh)} Ah`
      };

      get("batteryOut").innerHTML = `
        <div class="res">
          <div class="l">${t("backup")}</div>
          <div class="n">${backupText}</div>
          <div class="d">${t("loadCurrent")}: ${n(B.loadA)} A</div>
        </div>
        <div class="res">
          <div class="l">${t("requiredAh")}</div>
          <div class="n">${n(requiredAh)} Ah</div>
          <div class="d">${t("targetBackup")}: ${n(B.hours)} h · ${B.V} V</div>
        </div>
        <div class="res">
          <div class="l">${t("chargeTime")}</div>
          <div class="n">${n(chargeHours)} h</div>
          <div class="d">${t("chargeCurrent")}: ${n(B.chargeA)} A</div>
        </div>`;
    },

    click(el) {
      if (el.dataset.v) {
        B.V = Number(el.dataset.v);
        setOn("[data-v]", el);
        this.update();
        return true;
      }

      if (el.dataset.chem) {
        B.chem = el.dataset.chem;
        const c = CHEM[B.chem];
        if (c) {
          B.dod = c.dod;
          B.eff = c.eff;
          document.getElementById("bDod").value = B.dod;
          document.getElementById("bEff").value = B.eff;
        }
        setOn("[data-chem]", el);
        this.update();
        return true;
      }

      return false;
    }
  });
})();
