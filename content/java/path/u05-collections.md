---
id: java-u05-collections
subject: Java
level: 1
order: 5
title: Collections de base
description: List, Set, Map et leurs implémentations
language: fr
tags: java, parcours
---
# Collections de base

> **Objectif** : choisir entre `List`, `Set` et `Map`, et les manipuler sans surprise.

## 1. La famille des collections

![Hiérarchie des collections Java](./img/collections.svg)

| TypeScript | Java | Implémentation courante |
|---|---|---|
| `string[]` | `List<String>` | `ArrayList` |
| `Set<string>` | `Set<String>` | `HashSet` |
| `Map<string, number>` | `Map<String, Integer>` | `HashMap` |

`List`, `Set` et `Queue` étendent `Collection`. **`Map` n'étend pas `Collection`** : elle associe des clés à des valeurs.

## 2. `List` : ordonnée, avec doublons

```java
List<String> noms = new ArrayList<>();   // <> : le type est déduit
noms.add("Ada");
noms.add("Linus");
noms.get(0);              // "Ada"
noms.size();              // 2
noms.contains("Linus");   // true
noms.remove("Ada");       // supprime par valeur
for (String n : noms) System.out.println(n);

List<Integer> fixe = List.of(1, 2, 3);   // immuable
```

> **Piège** : sur une `List<Integer>`, `remove(1)` supprime l'**index** 1, alors que `remove(Integer.valueOf(1))` supprime la **valeur** 1.

```java
List<Integer> l = new ArrayList<>(List.of(10, 20, 30));
l.remove(1);                     // [10, 30]
l.remove(Integer.valueOf(10));   // [30]
```

## 3. `Set` : sans doublons

```java
Set<String> tags = new HashSet<>();
tags.add("java");
tags.add("java");        // ignoré
tags.size();             // 1
```

| Implémentation | Ordre |
|---|---|
| `HashSet` | aucun ordre garanti |
| `LinkedHashSet` | ordre d'insertion |
| `TreeSet` | ordre trié |

## 4. `Map` : clé vers valeur

```java
Map<String, Integer> ages = new HashMap<>();
ages.put("Ada", 36);
ages.get("Ada");                   // 36
ages.get("Inconnu");               // null : pas d'exception
ages.getOrDefault("Inconnu", 0);   // 0
ages.merge("Ada", 1, Integer::sum);   // 37 : crée ou combine la valeur
for (Map.Entry<String, Integer> e : ages.entrySet()) {
    System.out.println(e.getKey() + " = " + e.getValue());
}
```

## 5. Génériques et types enveloppes

Les collections ne contiennent que des **objets** : `List<Integer>`, pas `List<int>`. L'*autoboxing* convertit `int` en `Integer` automatiquement. Mais convertir un `Integer` `null` en `int` lève une `NullPointerException`.

```java
Map<String, Integer> m = new HashMap<>();
int v = m.get("absent");   // NullPointerException : null → int
```

## Erreurs fréquentes
- Croire que `Map` est une `Collection`.
- Confondre `remove(index)` et `remove(valeur)` sur `List<Integer>`.
- Utiliser `LinkedList` par réflexe : `ArrayList` est presque toujours meilleure.
- Oublier que `get` d'une clé absente renvoie `null`.

## À retenir
- `List` : ordre et doublons. `Set` : unicité. `Map` : clé vers valeur.
- Par défaut : `ArrayList`, `HashSet`, `HashMap`.
- `List.of(...)` crée une liste immuable.
- `getOrDefault` et `merge` évitent les `null` et les tests manuels.

@@ quiz col-001 easy
::question
Quelles collections n'autorisent **pas** les doublons ?
::choices
- [ ] ArrayList
- [x] HashSet
- [x] TreeSet
- [ ] LinkedList
::answer
`HashSet` et `TreeSet` (implémentations de `Set`).

@@ quiz n-add easy
::question
Comment ajouter `"x"` à une `List<String>` nommée `l` ?
::choices
- [x] l.add("x")
- [ ] l.push("x")
- [ ] l.append("x")
- [ ] l += "x"
::answer
`l.add("x")`.
::explanation
`push` est le vocabulaire JS (tableaux). En Java, `List` utilise `add`.

@@ quiz n-mapget easy
::question
Comment lire la valeur associée à la clé `k` dans une `Map` nommée `m` ?
::choices
- [x] m.get(k)
- [ ] m[k]
- [ ] m.read(k)
- [ ] m.value(k)
::answer
`m.get(k)`.
::explanation
Java n'a pas de syntaxe à crochets pour les maps.

@@ quiz n-mapnull easy
::question
Que renvoie `map.get("absent")` si la clé n'existe pas ?
::choices
- [x] null
- [ ] Une exception
- [ ] 0
- [ ] Une chaîne vide
::answer
`null`.
::explanation
Pour une valeur par défaut : `map.getOrDefault("absent", 0)`.
::hint
Il n'y a pas d'`undefined` en Java.

@@ quiz f2-020 medium
::question
Laquelle de ces interfaces **n'étend pas** `Collection` ?
::choices
- [ ] List
- [ ] Set
- [x] Map
- [ ] Queue
::answer
`Map`.
::explanation
`List`, `Set` et `Queue` étendent `Collection`. `Map` associe clés et valeurs et a sa propre hiérarchie.
::hint
Une `Map` stocke des paires clé/valeur, pas des éléments seuls.

@@ quiz f2-021 medium
::question
Quelle implémentation de `Set` conserve l'**ordre d'insertion** ?
::choices
- [ ] HashSet
- [ ] TreeSet
- [x] LinkedHashSet
- [ ] Aucune
::answer
`LinkedHashSet`.
::explanation
`HashSet` : aucun ordre garanti. `TreeSet` : ordre trié (naturel ou `Comparator`).

@@ card col-002 medium
::question
`ArrayList` ou `LinkedList` : quand choisir l'un ou l'autre ?
::answer
`ArrayList` dans la grande majorité des cas (accès par index O(1), bonne localité mémoire). `LinkedList` seulement pour de nombreuses insertions/suppressions en tête via un itérateur ou comme `Deque`.

@@ quiz f2-019 hard
::question
Que se passe-t-il avec ce code ?

```java
Integer x = null;
int y = x;
```
::choices
- [ ] y vaut 0
- [x] NullPointerException
- [ ] Erreur de compilation
- [ ] y vaut null
::answer
`NullPointerException` : l'*unboxing* d'un `Integer` `null` en `int` échoue.
::explanation
Piège classique avec les wrappers, par exemple en lisant une valeur `null` dans une `Map<String, Integer>`.
::hint
Que contient `x`, et que doit faire Java pour le convertir en `int` ?

@@ exercise e-mots medium Compter les mots
::question
Compte les occurrences de chaque mot de `texte` dans une `Map` triée (`TreeMap`). L'affichage est déjà écrit : complète le remplissage.
::starter
```java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        String texte = "java est simple java est puissant";
        Map<String, Integer> comptes = new TreeMap<>();
        // TODO : remplis comptes
        for (Map.Entry<String, Integer> e : comptes.entrySet()) {
            System.out.println(e.getKey() + "=" + e.getValue());
        }
    }
}
```
::solution
```java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        String texte = "java est simple java est puissant";
        Map<String, Integer> comptes = new TreeMap<>();
        for (String mot : texte.split(" ")) {
            comptes.merge(mot, 1, Integer::sum);
        }
        for (Map.Entry<String, Integer> e : comptes.entrySet()) {
            System.out.println(e.getKey() + "=" + e.getValue());
        }
    }
}
```
::expected
```
est=2
java=2
puissant=1
simple=1
```
::checks
- Utilise split pour découper
- Utilise merge ou getOrDefault
::hint
`texte.split(" ")` retourne un tableau de mots.
---
`comptes.merge(mot, 1, Integer::sum)` incrémente le compteur.
