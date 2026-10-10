# ElectroMind — Project Notes (हँडऑफ)

## उद्देश
Intelligent Electrical & Battery Calculator. मराठी + हिंदी + English. गॅरेजमध्ये उन्हात/तेलकट हातांनी वापरता येईल असे (मोठे बटण, जास्त कॉन्ट्रास्ट). Offline चालले पाहिजे.

## मर्यादा
- वापरकर्ता फक्त Android फोनवर काम करतो, laptop नाही. Beginner.
- सगळा कोड AI कडून मिळतो आणि GitHub वर browser मधून paste केला जातो.
- म्हणून: प्रत्येक फाइल वेगळी, पूर्ण फाइल द्यायची, लहान पायऱ्या.

## घेतलेले निर्णय
- **टप्पा १ (सध्या):** Web app, plain HTML/CSS/JS. GitHub Pages वर होस्ट: https://omchavan0.github.io/electromind/
- **टप्पा २ (नंतर):** Flutter Android ॲप (GitHub Actions ने APK build). टप्पा १ चे calculation engine हे logic reference म्हणून वापरायचे.
- **UI:** ChatGPT ने दिलेल्या ElectroMind light-theme ची रचना. फक्त लेआउट घ्यायचा, त्यातले आकडे चुकीचे आहेत (उदा. 1.5 mm² वायर 12V/10A/5m साठी चुकीचे).
- **Theme:** primary निळा #1456D9, bg #F3F5F9, text #0E1726, muted #5B6578, result हिरवा (#E3F6EA / #2E9E5B / #0B5A2C), सूचना अंबर #FFF4D6. Font: Mukta (मराठी/हिंदी/English).
- **Liquid-glass / dark neon थीम:** V1 मध्ये नाही. नंतर पर्याय म्हणून.
- Login/खाते नाही (offline-first). डेटा localStorage मध्ये.

## फाइल रचना (repo)

- `i18n.js`: सर्व मजकूर (mr/hi/en).
- `engine.js`: फक्त हिशोब (UI नाही).
- `core.js`: helpers, `App` state, `registerModule`.
- `mod-*.js`: प्रत्येक कॅल्क्युलेटर `registerModule({id, titleKey, subKey, big?, render, update, click})`.
- `app.js`: Home, History, router, events.
- `pwa.js` + `sw.js`: offline.
- नवा कॅल्क्युलेटर = नवी `js/mod-xxx.js` + `i18n.js` मध्ये मजकूर + `engine.js` मध्ये फॉर्म्युला + `index.html` व `sw.js` मध्ये फाइलची ओळ.

## सध्याची स्थिती (फोनवर चालते, वापरकर्त्याने तपासले)
- बॅकअप टाइम, वायर साइज, फ्यूज/रिले, इतिहास (सेव्ह), भाषा बदल (मर/हिं/EN), offline + Home screen install.
- Home वर "लवकरच": load, motor, res (रेझिस्टर), unit, ai.

## सूत्रे आणि गृहीतके (बदलू नका, फक्त सुधारायचे असल्यास सांगून)
- **बॅकअप:** उपयोगी Wh = V × Ah × DoD × कार्यक्षमता; वेळ = Wh ÷ W. Presets: लेड-अॅसिड 50%/85%, AGM 60%/85%, LiFePO4 80%/95%. लोड > Ah/5 (लेड-अॅसिड/AGM) तर "प्रत्यक्ष वेळ कमी" इशारा. निकाल "अंदाज".
- **वायर:** क्षेत्रफळ = ρ × 2 × L × I ÷ (V × ड्रॉप%). ρ तांबे 0.0175, अॅल्युमिनियम 0.0282 Ω·mm²/m (20°C). जाऊन-येऊन लांबी (2×). मानक साइज: 0.5…95 mm². क्षमता तक्ता अंदाजे (अॅल्युमिनियम ×0.78). उदाहरण: 12V, 10A, 5m, 3% → 6 mm², ड्रॉप 2.4%.
- **फ्यूज:** आवश्यक = I × 1.25 (साधा) किंवा × 1.5 (मोटर). पुढचा मानक फ्यूज, रिले (20/30/40/60/80), किमान वायर (फ्यूजपेक्षा जास्त क्षमता). उदा. 12V 250W साधा → फ्यूज 30A, रिले 30A, वायर 4 mm². हे अंदाज आहेत, इशारा दाखवला जातो.

## शिकलेल्या चुका (पुन्हा करू नका)
- JavaScript मध्ये global `top`, `name`, `status`, `history`, `parent`, `self` सारखी नावे variable/function म्हणून वापरू नका. (`const top` मुळे पेज कोरे झाले होते.)
- GitHub ॲपमध्ये फाइल जोडता येत नाही, Chrome मध्ये "Desktop site" चालू करून github.com वापरा.
- Pages साठी repo Public हवी.
- फाइल बदलल्यावर `index.html` मधील `?v=` आणि `sw.js` मधील `CACHE` नाव (`electromind-v3`→`v4`) वाढवा, नाहीतर फोन जुनी प्रत दाखवतो.
- प्रत्येक बदल कोड चालवून (jsdom/node) तपासून मगच द्यायचा. फोनवरची तपासणी वापरकर्ता करतो.

## पुढची कामे (क्रमाने)
1. **Ohm's Law / Circuit Lab:** V, I, R, P (कोणतेही दोन भरल्यावर बाकी), मालिका/समांतर रेझिस्टन्स.
2. **रेझिस्टर कलर कोड:** 4/5/6 band decode, उलट शोध (मूल्य → रंग), tolerance, temp coefficient.
3. **युनिट कन्व्हर्टर:** व्होल्टेज, करंट, पॉवर, ऊर्जा (Wh/kWh/J), प्रतिरोध.
4. **लोड कॅल्क्युलेटर:** अनेक लोड जोडून एकूण W/A, फ्यूज, वायर.
5. **मोटर आणि पॉवर:** DC, 1φ, 3φ AC, power factor, efficiency, HP↔kW.
6. **बॅटरी पॅक डिझायनर:** series/parallel (उदा. 13S4P), एकूण Wh, runtime.
7. **LED रेझिस्टर, कॅपॅसिटर कोड, DC-DC कन्व्हर्टर, "फ्यूज/वायर" सुधारणा.**
8. **स्मार्ट सहाय्यक (AI):** नैसर्गिक भाषेत प्रश्न → आकडे काढून आमच्या engine ने हिशोब (AI ने आकडे बनवायचे नाहीत). इंटरनेट लागेल म्हणून वेगळे, routine हिशोब offline राहतील.
9. **इतिहास सुधारणा:** शोध, export (JSON), PDF रिपोर्ट, Favorites.
10. **Unit tests:** engine.js साठी (कोड चालवून तपासलेले उदाहरणे वर दिली आहेत).
11. **टप्पा २:** Flutter Android ॲप + GitHub Actions APK. नंतर Google Drive बॅकअप (प्रत्येक वापरकर्त्याच्या स्वतःच्या Drive मध्ये, कमीत कमी permission), सिंक आणि खाते यावर वेगळा विचार.
12. **Public release:** Privacy Policy, Terms, Play Store आवश्यकता.

## नवीन चॅटची सुरुवात
"NOTES.md वाचा आणि 'पुढची कामे' मधील क्रमांक १ (Ohm's Law) सुरू करा. फाइल वेगळ्या आणि पूर्ण द्या."
