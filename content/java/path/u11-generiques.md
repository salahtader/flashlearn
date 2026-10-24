---
id: java-u10-generiques
subject: Java
level: 3
order: 11
title: Génériques
description: Effacement de type, jokers, PECS
language: fr
tags: java, parcours
---
# Génériques

> **Objectif** : écrire du code réutilisable et sûr à la compilation, et comprendre les jokers.

## 1. Classes et méthodes génériques

Comme en TypeScript, `<T>` est un paramètre de type : le compilateur vérifie la cohérence des types et supprime les `cast`.

```java
class Boite<T> {
    private final T valeur;
    Boite(T valeur) { this.valeur = valeur; }
    T get() { return valeur; }
}
Boite<String> b = new Boite<>("Ada");   // <> : le type est déduit
String s = b.get();                     // pas de cast

static <T extends Comparable<T>> T max(List<T> liste) {   // T doit être comparable
    T m = liste.get(0);
    for (T x : liste) if (x.compareTo(m) > 0) m = x;
    return m;
}
max(List.of(3, 9, 4));      // 9
max(List.of("a", "z"));     // "z"
```

`extends` dans `<T extends X>` signifie « T est X ou un sous-type de X » (y compris pour les interfaces).

## 2. L'effacement de type (*type erasure*)

À la différence de C# ou Kotlin, Java **efface** les types génériques à la compilation : à l'exécution, `List<String>` et `List<Integer>` sont la même classe `List`. Conséquences :

```java
// new T();                          // impossible : T n'existe pas à l'exécution
// if (o instanceof List<String>) {} // impossible
// T[] tab = new T[10];              // impossible : pas de tableau générique
List<String> a = new ArrayList<>();
List<Integer> b = new ArrayList<>();
System.out.println(a.getClass() == b.getClass());   // true
```

N'utilise jamais les **types bruts** (`List` sans `<>`) : tu perds la vérification du compilateur.

## 3. Les génériques sont invariants

Même si `String` est un `Object`, `List<String>` n'est **pas** une `List<Object>`.

```java
List<String> noms = new ArrayList<>();
// List<Object> objets = noms;   // ne compile pas
```

Pourquoi : si c'était permis, on pourrait ajouter un `Integer` dans `objets` et casser `noms`.

## 4. Jokers (*wildcards*) et PECS

| Notation | Sens | On peut… |
|---|---|---|
| `List<?>` | liste de type inconnu | lire en `Object` |
| `List<? extends Number>` | liste de `Number` ou d'un sous-type | **lire** en `Number`, pas ajouter |
| `List<? super Integer>` | liste d'`Integer` ou d'un parent | **ajouter** des `Integer`, lire en `Object` |

```java
static double somme(List<? extends Number> nombres) {    // producteur : on lit
    double t = 0;
    for (Number n : nombres) t += n.doubleValue();
    return t;
}
somme(List.of(1, 2, 3));        // List<Integer> accepté
somme(List.of(1.5, 2.5));       // List<Double> accepté

static void remplir(List<? super Integer> cible) {      // consommateur : on écrit
    for (int i = 0; i < 3; i++) cible.add(i);
}
remplir(new ArrayList<Number>());   // List<Number> accepté
```

> **PECS** : *Producer Extends, Consumer Super*. Si la collection **produit** des éléments que tu lis, `? extends T`. Si elle **consomme** des éléments que tu écris, `? super T`. Exemple de la bibliothèque : `Collections.copy(List<? super T> dest, List<? extends T> src)`.

## Erreurs fréquentes
- Croire que `List<Integer>` est une `List<Number>`.
- Utiliser des types bruts (`List l = new ArrayList();`).
- Vouloir `new T()` ou `instanceof List<String>`.
- Essayer d'ajouter dans une `List<? extends X>`.

## À retenir
- `<T>` pour la réutilisation, `<T extends X>` pour imposer des capacités.
- Effacement : les types n'existent pas à l'exécution.
- Invariance : `List<String>` n'est pas `List<Object>`.
- PECS pour choisir `extends` ou `super`.

@@ card gen-001 hard
::question
Qu'est-ce que l'effacement de type (*type erasure*) ?
::answer
Le compilateur supprime les paramètres de type génériques : à l'exécution, `List<String>` et `List<Integer>` sont de même type `List`.
::explanation
Conséquences : pas de `new T()`, pas de `instanceof List<String>`, pas de tableau générique.

@@ quiz gen-002 hard
::question
Lesquelles de ces affectations compilent ?
::choices
- [ ] List<Object> l = new ArrayList<String>();
- [x] List<?> l = new ArrayList<String>();
- [ ] List<String> l = new ArrayList<Object>();
- [x] List<? extends Number> l = new ArrayList<Integer>();
::answer
Les choix 2 et 4. Les génériques sont **invariants** : `List<String>` n'est pas un `List<Object>`. Les jokers (`?`, `? extends`) permettent la covariance en lecture.
::hint
Les génériques sont invariants : `List<String>` est-il un sous-type de `List<Object>` ?

@@ card gen-003 hard
::question
Que signifie le principe PECS (*Producer Extends, Consumer Super*) ?
::answer
Une collection qui **produit** des éléments (qu'on lit) se déclare `? extends T` ; une collection qui **consomme** des éléments (qu'on écrit) se déclare `? super T`.
::explanation
Exemple : `Collections.copy(List<? super T> dest, List<? extends T> src)`. Avec `? extends`, on peut lire en `T` mais on ne peut pas ajouter (hors `null`).

@@ quiz n-erase medium
::question
Pour `List<String> a = new ArrayList<>();` et `List<Integer> b = new ArrayList<>();`, que vaut `a.getClass() == b.getClass()` ?
::choices
- [x] true
- [ ] false
- [ ] erreur de compilation
- [ ] cela dépend de la JVM
::explanation
`true` : à cause de l'**effacement de type**, les deux sont de la même classe `ArrayList` à l'exécution.

@@ quiz n-nocomp hard
::question
Lesquelles de ces instructions ne compilent **pas** (dans une classe générique `<T>`) ?
::choices
- [x] new T()
- [ ] List<String> l = new ArrayList<>();
- [x] if (o instanceof List<String>) { }
- [x] T[] t = new T[3];
::explanation
Les types génériques n'existent pas à l'exécution : on ne peut pas instancier `T`, tester `instanceof List<String>` ni créer un tableau générique.
::hint
Pense à l'effacement de type.

@@ quiz n-super medium
::question
Quelle déclaration permet d'**ajouter** des `Integer` dans la liste ?
::choices
- [ ] List<? extends Number>
- [x] List<? super Integer>
- [ ] List<?>
- [ ] List<? extends Integer>
::explanation
`? super Integer` : la liste accepte des `Integer` en écriture (PECS : *Consumer Super*). Avec `? extends`, on ne peut que lire.

@@ exercise e-gen medium Méthodes génériques
::question
Complète `max` (le plus grand élément d'une liste de `Comparable`) et `somme` (somme de n'importe quelle liste de nombres).
::starter
```java
import java.util.*;

public class Main {
    static <T extends Comparable<T>> T max(List<T> liste) {
        // TODO
        return null;
    }

    static double somme(List<? extends Number> nombres) {
        // TODO
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(max(List.of(3, 9, 4)));
        System.out.println(max(List.of("a", "z")));
        System.out.println(somme(List.of(1, 2, 3)));
    }
}
```
::solution
```java
import java.util.*;

public class Main {
    static <T extends Comparable<T>> T max(List<T> liste) {
        T m = liste.get(0);
        for (T x : liste) {
            if (x.compareTo(m) > 0) m = x;
        }
        return m;
    }

    static double somme(List<? extends Number> nombres) {
        double total = 0;
        for (Number n : nombres) total += n.doubleValue();
        return total;
    }

    public static void main(String[] args) {
        System.out.println(max(List.of(3, 9, 4)));
        System.out.println(max(List.of("a", "z")));
        System.out.println(somme(List.of(1, 2, 3)));
    }
}
```
::expected
```
9
z
6.0
```
::checks
- Utilise compareTo pour comparer des T
- Le joker ? extends Number permet de lire des Number
::hint
`x.compareTo(m) > 0` : x est plus grand que m.
---
`n.doubleValue()` convertit n'importe quel `Number` en `double`.
::explanation
`T extends Comparable<T>` garantit que `compareTo` existe. `? extends Number` accepte `List<Integer>`, `List<Double>`… en lecture (PECS : *Producer Extends*).
