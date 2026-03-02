# 🛡️ SÁLVAME — App de Seguridad Personal para el Perú

> **Tu seguridad en 2 clicks.** Con solo 2 clicks (incluso con la pantalla apagada), SÁLVAME envía alertas de SOS con tu ubicación GPS en tiempo real a tus contactos de confianza.

---

## 🚨 El Problema

El miedo constante a ser atacado, asaltado o secuestrado en la calle es una realidad diaria en Lima Metropolitana. En el momento de peligro real, **no hay tiempo para desbloquear el celular, abrir una app y pedir ayuda**.

## ✅ La Solución

**2 clicks en menos de 800ms** → alerta enviada con ubicación GPS en tiempo real → tus contactos saben dónde estás.

---

## 📱 Stack Tecnológico

| Capa | Tecnología | Razón |
|------|-----------|-------|
| Mobile App | React Native + Expo | Cross-platform, EAS Build |
| Background (Android) | expo-task-manager + expo-notifications | Foreground Service |
| Backend | Firebase (Firestore + Cloud Functions) | Tiempo real, tier gratuito |
| SMS | Twilio SMS API | Confiable, SDK Node.js |
| SMS Fallback | expo-sms (nativo) | Sin internet |
| GPS | expo-location | Background tracking |
| Web Tracker | Firebase Hosting | Sin instalar app |

---

## 🏗️ Arquitectura del Proyecto

```
├── App.tsx                          # Entry point
├── app.json                         # Expo config
├── eas.json                         # EAS Build config
├── firestore.rules                  # Firestore security rules
│
├── src/
│   ├── types/index.ts               # TypeScript types + APP_CONFIG
│   ├── constants/theme.ts           # Design system (dark mode, #E8281A)
│   ├── utils/helpers.ts             # Formatters, validators
│   │
│   ├── services/
│   │   ├── firebase.ts              # Firebase initialization
│   │   ├── alertService.ts          # SOS session management
│   │   ├── locationService.ts       # GPS tracking (solo durante alertas)
│   │   ├── backgroundService.ts     # Android Foreground Service
│   │   └── storageService.ts        # AsyncStorage + SecureStore
│   │
│   ├── hooks/
│   │   ├── useSOSButton.ts          # Double-click + countdown logic
│   │   └── useContacts.ts           # Contact management
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx         # Root navigator
│   │   ├── OnboardingNavigator.tsx  # Onboarding flow
│   │   └── MainNavigator.tsx        # Tab navigator
│   │
│   └── screens/
│       ├── onboarding/
│       │   ├── WelcomeScreen.tsx
│       │   ├── LocationPermissionScreen.tsx
│       │   ├── AddFirstContactScreen.tsx
│       │   └── TestAlertScreen.tsx
│       ├── main/
│       │   ├── HomeScreen.tsx        # ← PANTALLA PRINCIPAL (botón SOS)
│       │   ├── SOSCountdownScreen.tsx # 8s countdown
│       │   └── SOSActiveScreen.tsx   # Alerta activa
│       ├── contacts/
│       │   └── ContactsScreen.tsx
│       └── settings/
│           └── SettingsScreen.tsx
│
├── functions/
│   └── src/index.ts                 # Cloud Functions (Twilio, expiry)
│
└── web-tracker/
    └── public/index.html            # Mapa de seguimiento (sin instalar app)
```

---

## 🚀 Setup Rápido

### 1. Clonar y instalar

```bash
git clone https://github.com/RichardEsteban/SecurityApp.git
cd SecurityApp
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales de Firebase y Twilio
```

### 3. Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Firestore, Authentication, Cloud Functions
3. Copiar config a `.env`
4. Descargar `google-services.json` → raíz del proyecto

### 4. Configurar Twilio

```bash
cd functions
firebase functions:config:set \
  twilio.account_sid="ACxxxxxxxx" \
  twilio.auth_token="your_token" \
  twilio.phone_number="+1xxxxxxxxxx"
```

### 5. Deploy Cloud Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

### 6. Correr en Android

```bash
npx expo start --android
# O build con EAS:
eas build --platform android --profile preview
```

---

## 🎯 Funcionalidades MVP (Fase 1)

- [x] **Botón SOS de doble-click** (800ms window)
- [x] **Cuenta regresiva de 8 segundos** con cancelación
- [x] **Vibración háptica** diferenciada (activar / cancelar)
- [x] **SMS via Twilio** con link de tracking
- [x] **Fallback SMS nativo** (sin internet, via expo-sms)
- [x] **GPS tracking en tiempo real** (solo durante alertas)
- [x] **Web tracker** para contactos (sin instalar app)
- [x] **Gestión de contactos** (hasta 3 en plan gratuito)
- [x] **Onboarding de 3 pasos** (<3 minutos)
- [x] **Android Foreground Service** (pantalla apagada)
- [x] **Dark mode** por defecto
- [x] **Ley 29733** compliant (privacidad de datos)

## 🔮 Roadmap

- **Fase 2:** Check-in automático, modo "camino peligroso", soporte iOS
- **Fase 3:** WhatsApp Business API, Premium B2C (S/. 9.90/mes), Panel B2B
- **Fase 4:** IA + integración con Serenazgo/PNP

---

## 🔒 Privacidad

- GPS **nunca** activo en background sin alerta activa
- Links de tracking expiran automáticamente a las 2 horas
- Cumplimiento con **Ley 29733** (Perú)
- Datos nunca vendidos ni compartidos con terceros

---

## 📊 Modelo de Negocio

| Segmento | Precio | Target |
|----------|--------|--------|
| B2C Free | Gratis | Validación inicial |
| B2C Premium | S/. 9.90/mes | 8-12% conversión mes 6 |
| B2B Corporativo | S/. 30-80/empleado/mes | Personal de campo |
| B2G Municipal | SaaS por distrito | Serenazgo |

---

## 🇵🇪 Contexto de Mercado

- **+80%** penetración Android en Perú
- **98%** penetración WhatsApp en smartphones peruanos
- **Android 8.0+** como versión mínima (>90% dispositivos activos)
- **Competencia directa local:** prácticamente ninguna

---

*Construido con ❤️ para el mercado peruano. SÁLVAME — Porque tu seguridad importa.*
