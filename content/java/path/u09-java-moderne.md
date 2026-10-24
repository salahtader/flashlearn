---
id: java-u09-java-moderne
subject: Java
level: 2
order: 9
title: Java moderne
description: Lambdas, streams, Optional, records, sealed, switch
language: fr
tags: java, parcours
---
# Java moderne : lambdas, streams, Optional, records

> **Objectif** : écrire du Java concis et lisible avec les fonctionnalités récentes (Java 8 à 21).

## 1. Lambdas et interfaces fonctionnelles

Une **interface fonctionnelle** n'a qu'**une** méthode abstraite : on peut l'implémenter avec une lambda. Les plus courantes, dans `java.util.function` :

| Interface | Signature | Exemple |
|---|---|---|
| `Predicate<T>` | `T → boolean` | `s -> s.isEmpty()` |
| `Function<T,R>` | `T → R` | `s -> s.length()` |
| `Consumer<T>` | `T → void` | `s -> System.out.println(s)` |
| `Supplier<T>` | `() → T` | `() -> new ArrayList<>()` |
| `UnaryOperator<T>` | `T → T` | `s -> s.trim()` |
| `BiFunction<T,U,R>` | `(T,U) → R` | `(a, b) -> a + b` |

```java
Predicate<String> vide = s -> s.isEmpty();
Function<String, Integer> taille = String::length;   // référence de méthode
vide.test("");                                        // true
```

## 2. Streams

Un stream est un **pipeline** : une source, des opérations intermédiaires (paresseuses), une opération terminale qui déclenche le calcul. Un stream ne se consomme qu'une fois.

```java
List<String> noms = List.of("ada", "grace", "linus", "bob", "margaret");

List<String> resultat = noms.stream()
    .filter(n -> n.length() > 3)      // intermédiaire
    .map(String::toUpperCase)         // intermédiaire
    .sorted()                         // intermédiaire
    .toList();                        // terminale : [GRACE, LINUS, MARGARET]

int total = List.of(1, 2, 3, 4).stream().mapToInt(Integer::intValue).sum();   // 10

Map<Integer, List<String>> parLongueur =
    noms.stream().collect(Collectors.groupingBy(String::length));
// {3=[ada, bob], 5=[grace, linus], 8=[margaret]}
```

Équivalents JavaScript : `filter`, `map`, `reduce`. La grande différence : rien ne s'exécute tant qu'il n'y a pas d'opération terminale (`toList`, `collect`, `forEach`, `count`…).

## 3. `Optional`

`Optional<T>` représente « une valeur ou rien », pour un type de **retour**. Évite-le en champ ou en paramètre.

```java
Optional<String> premier = noms.stream().filter(n -> n.startsWith("g")).findFirst();
String v = premier.map(String::toUpperCase).orElse("aucun");   // "GRACE"
premier.ifPresent(System.out::println);
String s = premier.orElseThrow();            // lève NoSuchElementException si vide
String t = premier.orElseGet(() -> calcul()); // calcul() n'est évalué que si vide (orElse l'évalue toujours)
```

## 4. `record`, `var`, blocs de texte

```java
record Point(int x, int y) {}          // constructeur, accesseurs x() et y(), equals, hashCode, toString
Point p = new Point(1, 2);
System.out.println(p);                 // Point[x=1, y=2]

record Plage(int min, int max) {
    Plage {                            // constructeur compact : validation
        if (min > max) throw new IllegalArgumentException("min > max");
    }
}
var liste = new ArrayList<Point>();    // var : type déduit (variables locales)
```

Un `record` est immuable (de façon superficielle : un champ objet mutable reste modifiable).

## 5. `sealed`, `switch` et *pattern matching* (Java 17 à 21)

`sealed` restreint les sous-types autorisés. Le compilateur sait alors qu'un `switch` couvre tous les cas.

```java
sealed interface Forme permits Cercle, Carre {}
record Cercle(double r) implements Forme {}
record Carre(double c) implements Forme {}

static double aire(Forme f) {
    return switch (f) {                       // pas de default : exhaustivité vérifiée
        case Cercle c -> Math.PI * c.r() * c.r();
        case Carre c  -> c.c() * c.c();
    };
}

int n = switch (jour) {
    case SAMEDI, DIMANCHE -> 0;
    case VENDREDI -> { int h = 6; yield h; }   // yield : valeur d'un bloc
    default -> 8;
};
```

## Erreurs fréquentes
- Croire qu'un stream s'exécute sans opération terminale.
- Réutiliser un stream déjà consommé.
- Appeler `Optional.get()` sans vérifier (préfère `orElse`, `map`, `orElseThrow`).
- Modifier une variable locale dans une lambda : elle doit être *effectivement finale*.

## À retenir
- Lambda = implémentation d'une interface fonctionnelle.
- Stream : intermédiaires paresseuses, une terminale, usage unique.
- `Optional` en retour ; `orElseGet` est paresseux, `orElse` non.
- `record` pour des données immuables ; `sealed` + `switch` pour des cas exhaustifs.

@@ card lam-001 easy
::question
Qu'est-ce qu'une interface fonctionnelle ?
::answer
Une interface avec **une seule méthode abstraite**, utilisable comme cible d'une lambda ou d'une référence de méthode. Annotation optionnelle `@FunctionalInterface` pour la faire vérifier.
::explanation
Exemples : `Function<T,R>`, `Predicate<T>`, `Supplier<T>`, `Consumer<T>`, `Runnable`, `Comparator<T>`.

@@ quiz lam-002 easy
::question
Quelle interface fonctionnelle prend un argument et retourne un `boolean` ?
::choices
- [x] Predicate<T>
- [ ] Supplier<T>
- [ ] Consumer<T>
- [ ] UnaryOperator<T>
::answer
`Predicate<T>` (méthode `test`).
::explanation
`Function<T,R>` transforme, `Supplier<T>` fournit sans argument, `Consumer<T>` consomme sans résultat.

@@ card str-002 medium
::question
Opérations intermédiaires vs terminales d'un `Stream` ?
::answer
Les intermédiaires (`map`, `filter`…) sont **paresseuses** et retournent un `Stream`. Les terminales (`collect`, `forEach`, `reduce`…) déclenchent le traitement ; un stream ne se consomme qu'une fois.

@@ card opt-001 medium
::question
Quelles sont les bonnes pratiques avec `Optional` ?
::answer
L'utiliser comme **type de retour** pour une absence possible. Éviter en champ, en paramètre ou en collection. Préférer `map`, `orElse`, `orElseGet`, `orElseThrow` à `get()`.
::explanation
`orElse(x)` évalue toujours `x` ; `orElseGet(supplier)` ne l'évalue que si l'`Optional` est vide.

@@ card rec-001 medium
::question
Que génère le compilateur pour ce `record` ?

```java
record Point(int x, int y) {}
```
::answer
Champs `private final`, constructeur canonique, accesseurs `x()` et `y()`, ainsi que `equals`, `hashCode` et `toString`. Le record est implicitement `final`.
::explanation
Disponible depuis Java 16. Immuabilité *superficielle* : un champ de type objet mutable reste modifiable. Un constructeur compact permet de valider les arguments.

@@ card sw-001 medium
::question
Que fait `yield` dans cette *switch expression* ?

```java
int n = switch (day) {
    case SATURDAY, SUNDAY -> 0;
    case FRIDAY -> { int h = 6; yield h; }
    default -> 8;
};
```
::answer
`yield` renvoie la valeur d'un **bloc** de la *switch expression* (Java 14+). Pas de *fall-through*, et l'expression doit être exhaustive.
::explanation
Les flèches `->` évitent les `break` oubliés. `case SATURDAY, SUNDAY` regroupe plusieurs valeurs.

@@ card sealed-001 hard
::question
À quoi servent les classes `sealed` (Java 17) ?
::answer
À **restreindre** les sous-types autorisés avec `permits`. Chaque sous-type doit être `final`, `sealed` ou `non-sealed`.
::explanation
Le compilateur connaît tous les cas : un `switch` avec *pattern matching* peut être vérifié comme exhaustif, sans `default`.

@@ exercise e-stream medium Streams
::question
Avec la liste de prénoms, garde ceux de plus de 3 lettres, passe-les en majuscules, trie-les et affiche-les séparés par `, `.
::starter
```java
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<String> noms = List.of("ada", "grace", "linus", "bob", "margaret");
        // TODO : un seul pipeline de stream
    }
}
```
::solution
```java
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<String> noms = List.of("ada", "grace", "linus", "bob", "margaret");
        String resultat = noms.stream()
            .filter(n -> n.length() > 3)
            .map(String::toUpperCase)
            .sorted()
            .collect(Collectors.joining(", "));
        System.out.println(resultat);
    }
}
```
::expected
```
GRACE, LINUS, MARGARET
```
::checks
- filter, map, sorted, puis une opération terminale
- Pas de boucle for
::hint
Enchaîne `.filter(...)`, `.map(...)`, `.sorted()`.
---
`Collectors.joining(", ")` assemble le texte.
