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
# Dates et heures avec java.time

En JavaScript, `Date` est mutable et les mois vont de 0 à 11. Depuis Java 8, le package `java.time` règle ces problèmes : classes **immuables** et mois de **1 à 12**.

| Classe | Représente |
|---|---|
| `LocalDate` | une date (sans heure ni fuseau) |
| `LocalTime` | une heure |
| `LocalDateTime` | date et heure, sans fuseau |
| `ZonedDateTime` | date, heure et fuseau |
| `Instant` | un point précis sur la ligne du temps (UTC) |
| `Period` | une durée en années/mois/jours |
| `Duration` | une durée en heures/minutes/secondes |

```java
LocalDate d = LocalDate.of(2026, 10, 23);       // octobre = 10
LocalDate demain = d.plusDays(1);               // nouvelle instance : d ne change pas
Period p = Period.between(LocalDate.of(1990, 5, 15), d);
System.out.println(p.getYears());               // 36

DateTimeFormatter f = DateTimeFormatter.ofPattern("dd/MM/yyyy");
System.out.println(d.format(f));                // 23/10/2026
```
Ne manipule plus `java.util.Date` ni `Calendar` dans du code neuf.

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
