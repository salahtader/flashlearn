---
id: java-u10-time
subject: Java
level: 2
order: 10
title: Dates et heures (java.time)
description: LocalDate, Period, Duration, formatage
language: fr
tags: java, time
---
# Dates et heures avec `java.time`

> **Objectif** : manipuler dates, heures, durées et fuseaux avec l'API moderne, sans les pièges de `Date`.

## 1. Pourquoi `java.time`

En JavaScript, `Date` est mutable, ses mois vont de 0 à 11 et les fuseaux sont confus. Java avait le même problème avec `java.util.Date` et `Calendar`. Depuis Java 8, le package `java.time` règle tout : classes **immuables**, mois de **1 à 12**, types distincts selon ce qu'on représente.

| Classe | Représente | Exemple |
|---|---|---|
| `LocalDate` | une date, sans heure ni fuseau | `2026-10-23` |
| `LocalTime` | une heure | `14:30` |
| `LocalDateTime` | date et heure, sans fuseau | `2026-10-23T14:30` |
| `ZonedDateTime` | date, heure **et** fuseau | `2026-10-23T14:30+02:00[Europe/Paris]` |
| `Instant` | un point précis sur la ligne du temps (UTC) | un horodatage |
| `Period` | un écart en années, mois, jours | `P1Y2M3D` |
| `Duration` | un écart en heures, minutes, secondes | `PT1H30M` |

Règle : `LocalDate` / `LocalDateTime` pour des données métier (anniversaire, rendez-vous), `Instant` pour des événements techniques (logs, horodatages), `ZonedDateTime` pour afficher à un utilisateur dans son fuseau.

## 2. Créer et calculer

```java
LocalDate d = LocalDate.of(2026, 10, 23);          // octobre = 10 (et non 9 comme en JS)
LocalDate d2 = LocalDate.of(2026, Month.OCTOBER, 23);
LocalDate aujourdhui = LocalDate.now();
LocalDate demain = d.plusDays(1);                  // nouvelle instance : d ne change pas
d.getDayOfWeek();                                  // FRIDAY
d.isBefore(demain);                                // true

LocalTime t = LocalTime.of(14, 30);
LocalDateTime dt = LocalDateTime.of(d, t);
```

Les calculs ajustent au calendrier réel :

```java
LocalDate.of(2024, 1, 31).plusMonths(1);   // 2024-02-29 : le jour est ramené au dernier jour valide
```

## 3. `Period`, `Duration` et `ChronoUnit`

```java
LocalDate naissance = LocalDate.of(1990, 5, 15);
Period p = Period.between(naissance, d);          // écart de calendrier
p.getYears();                                     // 36

long jours = ChronoUnit.DAYS.between(naissance, d);   // nombre total de jours

Duration duree = Duration.between(LocalTime.of(9, 0), LocalTime.of(10, 30));
duree.toMinutes();                                // 90
```

`Period` mesure un écart de **calendrier** (un mois n'a pas de durée fixe). `Duration` mesure un temps **exact**.

## 4. Formater et analyser

```java
DateTimeFormatter f = DateTimeFormatter.ofPattern("dd/MM/yyyy");
String texte = d.format(f);                        // "23/10/2026"
LocalDate lu = LocalDate.parse("23/10/2026", f);   // texte → date
LocalDate iso = LocalDate.parse("2026-10-23");     // format ISO : pas de formateur nécessaire
```

Un texte invalide lève `DateTimeParseException`. Dans un motif, `MM` = mois, `mm` = minutes, `yyyy` = année, `HH` = heure sur 24 h.

## 5. Fuseaux horaires

```java
ZoneId paris = ZoneId.of("Europe/Paris");
ZonedDateTime rdv = ZonedDateTime.of(LocalDateTime.of(2026, 10, 23, 14, 30), paris);
ZonedDateTime enCasa = rdv.withZoneSameInstant(ZoneId.of("Africa/Casablanca"));
Instant instant = rdv.toInstant();                 // le même moment, en UTC
```

Stocke les moments en `Instant` (ou en UTC) et convertis en fuseau local seulement pour l'affichage.

## Erreurs fréquentes
- Écrire `LocalDate.of(2026, 9, 1)` en pensant à septembre en JS-style : c'est bien septembre ici (mois 1 à 12).
- Oublier que `plusDays` renvoie une **nouvelle** instance : `d.plusDays(1);` seul ne change rien.
- Confondre `MM` (mois) et `mm` (minutes) dans un motif.
- Utiliser `java.util.Date` ou `Calendar` dans du code neuf.

## À retenir
- Classes immuables, mois de 1 à 12.
- `LocalDate` / `LocalDateTime` sans fuseau ; `Instant` pour un moment précis ; `ZonedDateTime` avec fuseau.
- `Period` pour le calendrier, `Duration` pour le temps exact.
- `DateTimeFormatter.ofPattern(...)` pour formater et analyser.

@@ quiz t1 easy
::question
Quelle classe représente une date **sans** heure ni fuseau ?
::choices
- [ ] java.util.Date
- [x] LocalDate
- [ ] Instant
- [ ] ZonedDateTime
::explanation
`LocalDate` ne contient que année, mois et jour.

@@ quiz t2 medium
::question
Que vaut `d` après ce code ?
```java
LocalDate d = LocalDate.of(2026, 1, 31);
d.plusDays(1);
```
::choices
- [ ] 2026-02-01
- [x] 2026-01-31
- [ ] Une exception est levée
- [ ] null
::explanation
Les classes de `java.time` sont **immuables** : `plusDays` retourne une nouvelle instance qu'il faut récupérer (`d = d.plusDays(1);`).
::hint
Pense à `String.toUpperCase()` : même principe.

@@ quiz t3 medium
::question
`LocalDate.of(2026, 3, 1)` représente quel mois ?
::choices
- [x] Mars
- [ ] Avril
- [ ] Février
- [ ] Le code ne compile pas
::explanation
Contrairement à `Date` en JavaScript (mois de 0 à 11), `java.time` numérote les mois de 1 à 12.

@@ quiz t4 medium
::question
Lesquelles de ces classes sont immuables ?
::choices
- [x] LocalDate
- [ ] java.util.Date
- [x] Duration
- [ ] java.util.Calendar
::explanation
`java.util.Date` et `Calendar` sont mutables, d'où de nombreux bugs. Préfère `java.time`.

@@ card t5 medium
::question
`Duration` ou `Period` : quelle différence ?
::answer
`Duration` mesure un temps exact en heures, minutes, secondes. `Period` mesure un écart de calendrier en années, mois, jours.
::explanation
Un mois n'a pas une durée fixe : on utilise donc `Period` pour « dans 1 mois » et `Duration` pour « dans 90 minutes ».

@@ card t6 easy
::question
Quelle classe représente un instant précis (horodatage UTC) ?
::answer
`Instant`.
::explanation
Utile pour stocker des moments (logs, événements). On le convertit en `ZonedDateTime` pour l'afficher dans un fuseau.

@@ exercise x1 easy Calculer un âge et formater une date
::question
Affiche l'âge de la personne (en années complètes) puis la date du jour au format `jj/MM/aaaa`.
::starter
```java
import java.time.*;
import java.time.format.DateTimeFormatter;

public class Main {
    public static void main(String[] args) {
        LocalDate naissance = LocalDate.of(1990, 5, 15);
        LocalDate aujourdhui = LocalDate.of(2026, 10, 23);
        // TODO : affiche "Age : N" puis la date du jour au format jj/MM/aaaa
    }
}
```
::solution
```java
import java.time.*;
import java.time.format.DateTimeFormatter;

public class Main {
    public static void main(String[] args) {
        LocalDate naissance = LocalDate.of(1990, 5, 15);
        LocalDate aujourdhui = LocalDate.of(2026, 10, 23);
        int age = Period.between(naissance, aujourdhui).getYears();
        System.out.println("Age : " + age);
        System.out.println(aujourdhui.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
    }
}
```
::expected
```
Age : 36
23/10/2026
```
::checks
- Utilise Period (pas de calcul à la main)
- Utilise DateTimeFormatter avec le motif dd/MM/yyyy
::hint
`Period.between(debut, fin)` retourne un `Period`.
---
Le motif du formateur : `ofPattern("dd/MM/yyyy")`.
::explanation
`Period.between` gère les années bissextiles et la longueur des mois pour toi.
