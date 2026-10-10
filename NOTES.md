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
