# AESTAS Perfumes Shop

Statische Shop-Webseite mit:

- Produktliste und Formular zum Hinzufügen neuer Produkte
- Warenkorb mit Mengensteuerung und Gesamtsumme
- Google Maps Adresssuche mit eingebetteter Karte
- KI Chatbot (lokale Antworten für Shop-Fragen)
- Interner Support Chat (lokaler Verlauf)

Alle Daten werden im Browser via `localStorage` gespeichert.

## Lokal starten

Nutze einen beliebigen statischen Server in diesem Ordner, zum Beispiel:

```bash
npx serve .
```

Danach die angezeigte lokale URL im Browser öffnen.

## GitHub Upload

Die Seite ist static-hosting-fähig (z. B. GitHub Pages), weil kein Backend notwendig ist.

## Wichtige Dateien

- `index.html` - Struktur für Shop, Warenkorb, Maps und Chats
- `styles.css` - Layout, responsive Design und UI-Styles
- `script.js` - komplette Interaktionslogik mit `localStorage`
- `assets/images/*` - vorhandene Bilddateien für Produkte
