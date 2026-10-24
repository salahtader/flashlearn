---
id: java-u07-egalite
subject: Java
level: 2
order: 7
title: Égalité, tri et pièges des collections
description: equals/hashCode, cache Integer, Comparator, immuabilité
language: fr
tags: java, parcours
---
# Égalité, tri et pièges des collections

> **Objectif** : redéfinir correctement `equals` et `hashCode`, trier des objets et éviter les pièges classiques.

## 1. Le contrat `equals` / `hashCode`

`HashMap` et `HashSet` retrouvent un élément en deux temps : `hashCode()` désigne le *bucket*, puis `equals()` confirme. Le contrat :

> Si `a.equals(b)`, alors `a.hashCode() == b.hashCode()`. L'inverse n'est pas exigé.

```java
class Point {
    final int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Point p)) return false;
        return x == p.x && y == p.y;
    }
    @Override
    public int hashCode() { return Objects.hash(x, y); }
}

Set<Point> set = new HashSet<>();
set.add(new Point(1, 2));
set.add(new Point(1, 2));
System.out.println(set.size());   // 1
```

Sans `hashCode()`, les deux points tombent souvent dans des buckets différents : le set en garde **deux**. Utilise des champs **immuables** : si un champ change après l'insertion, l'objet devient introuvable.

## 2. Chaînes et entiers : l'égalité qui « marche par hasard »

```java
String a = "ok", b = "ok", c = new String("ok");
System.out.println(a == b);         // true  : littéraux partagés (pool de chaînes)
System.out.println(a == c);         // false : nouvel objet
System.out.println(a.equals(c));    // true

Integer x = 127, y = 127, z = 128, w = 128;
System.out.println(x == y);         // true  : cache des valeurs -128 à 127
System.out.println(z == w);         // false : nouveaux objets
```

Pour les `String` et les wrappers (`Integer`, `Long`…), compare **toujours** avec `equals()`.

## 3. Trier

- `Comparable<T>` : l'**ordre naturel**, défini dans la classe (`compareTo`).
- `Comparator<T>` : un ordre **externe**, on peut en avoir plusieurs.

```java
record Personne(String nom, int age) {}

List<Personne> gens = new ArrayList<>(List.of(new Personne("Ada", 36), new Personne("Alan", 41), new Personne("Ada", 29)));
gens.sort(Comparator.comparing(Personne::nom).thenComparing(Personne::age));
// [Ada 29, Ada 36, Alan 41]
gens.sort(Comparator.comparingInt(Personne::age).reversed());   // du plus âgé au plus jeune
```

## 4. Pièges des collections

**Modifier une liste pendant qu'on la parcourt** lève `ConcurrentModificationException` (l'itérateur est *fail-fast*).

```java
List<Integer> l = new ArrayList<>(List.of(1, 2, 3));
for (Integer v : l) { if (v == 1) l.remove(v); }   // ConcurrentModificationException

l.removeIf(v -> v == 1);                           // OK
Iterator<Integer> it = l.iterator();               // OK aussi
while (it.hasNext()) if (it.next() == 2) it.remove();
```

**Listes immuables** :

| Création | Modifiable ? |
|---|---|
| `List.of(...)`, `List.copyOf(l)` | non, indépendante de la source |
| `Collections.unmodifiableList(l)` | non, mais c'est une **vue** : elle suit `l` |
| `Arrays.asList(...)` | `set` oui, `add`/`remove` non |

**`null` dans les maps** : `HashMap` accepte une clé et des valeurs `null` ; `ConcurrentHashMap` et `List.of` n'en acceptent pas.

## Erreurs fréquentes
- Redéfinir `equals` sans `hashCode`.
- Comparer des `Integer` ou des `String` avec `==`.
- Supprimer pendant un for-each.
- Croire que `Collections.unmodifiableList` copie la liste.

## À retenir
- `equals` et `hashCode` vont ensemble, sur les mêmes champs.
- `Comparator.comparing(...).thenComparing(...)` pour trier proprement.
- `removeIf` ou `Iterator.remove()` pour supprimer en parcourant.
- `List.of` / `List.copyOf` = vraiment immuables.

@@ card eq-002 medium
::question
Quel est le contrat entre `equals()` et `hashCode()` ?
::answer
Deux objets égaux selon `equals()` doivent avoir le même `hashCode()`. L'inverse n'est pas requis.
::explanation
Sinon `HashMap` et `HashSet` ne retrouvent pas correctement les éléments.
::hint
`HashMap` retrouve un élément par `hashCode` d'abord, puis par `equals`.

@@ card str-001 medium
::question
Quelle est la sortie de ce code ?

```java
String s1 = "a";
String s2 = "a";
String s3 = new String("a");
System.out.println(s1 == s2);
System.out.println(s1 == s3);
```
::answer
`true` puis `false`.
::explanation
Les littéraux sont internés (même référence). `new String("a")` crée un nouvel objet. Utiliser `equals()` pour comparer le contenu.

@@ card wrap-001 medium
::question
Quelle est la sortie de ce code ?

```java
Integer a = 127, b = 127, c = 128, d = 128;
System.out.println((a == b) + " " + (c == d));
```
::answer
`true false`
::explanation
`Integer.valueOf` (utilisé par l'autoboxing) met en cache les valeurs de -128 à 127 : même référence pour 127, nouveaux objets pour 128. Comparer les wrappers avec `equals()`.
::hint
Il existe un cache pour les petits entiers : jusqu'à quelle valeur ?

@@ card col-005 medium
::question
`Comparable` vs `Comparator` ?
::answer
`Comparable<T>` : ordre **naturel** défini dans la classe (`compareTo`). `Comparator<T>` : ordre **externe**, plusieurs possibles (`compare`), composable avec `Comparator.comparing(...).thenComparing(...)`.

@@ card col-004 medium
::question
`HashMap`, `Hashtable`, `ConcurrentHashMap` : quand utiliser lequel ?
::answer
`HashMap` : non thread-safe, accepte une clé `null` et des valeurs `null`. `Hashtable` : ancien, entièrement synchronisé, à éviter. `ConcurrentHashMap` : thread-safe avec verrouillage fin, très scalable, **ni clé ni valeur `null`**.

@@ card col-006 hard
::question
Que se passe-t-il à l'exécution de ce code ?

```java
List<Integer> l = new ArrayList<>(List.of(1, 2, 3));
for (Integer x : l) {
    if (x == 1) l.remove(x);
}
```
::answer
Une `ConcurrentModificationException` est levée.
::explanation
L'itérateur est *fail-fast* : il compare un compteur de modifications (`modCount`). Corrections : `Iterator.remove()`, `list.removeIf(...)` ou parcourir une copie. Piège : en supprimant l'avant-dernier élément, la boucle s'arrête sans exception.
::hint
Que vérifie l'itérateur à chaque appel de `next()` ?

@@ quiz col-007 hard
::question
Lesquelles produisent une liste impossible à modifier, **indépendante** de sa source ?
::choices
- [x] List.of(1, 2)
- [ ] Arrays.asList(1, 2)
- [ ] Collections.unmodifiableList(list)
- [x] List.copyOf(list)
::answer
`List.of(...)` et `List.copyOf(...)`.
::explanation
`Collections.unmodifiableList` n'est qu'une **vue** : elle reflète les changements de la liste source. `Arrays.asList` est de taille fixe mais autorise `set`.
::hint
Une *vue* reflète-t-elle les changements de sa source ?

@@ exercise e-equals hard equals et hashCode
::question
Complète la classe `Point` pour que deux points de mêmes coordonnées soient égaux : le `HashSet` ne doit en garder qu'un.
::starter
```java
import java.util.*;

class Point {
    final int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
    // TODO : equals et hashCode
}

public class Main {
    public static void main(String[] args) {
        Set<Point> set = new HashSet<>();
        set.add(new Point(1, 2));
        set.add(new Point(1, 2));
        System.out.println(set.size());
        System.out.println(new Point(1, 2).equals(new Point(1, 2)));
    }
}
```
::solution
```java
import java.util.*;

class Point {
    final int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Point p)) return false;
        return x == p.x && y == p.y;
    }

    @Override
    public int hashCode() { return Objects.hash(x, y); }
}

public class Main {
    public static void main(String[] args) {
        Set<Point> set = new HashSet<>();
        set.add(new Point(1, 2));
        set.add(new Point(1, 2));
        System.out.println(set.size());
        System.out.println(new Point(1, 2).equals(new Point(1, 2)));
    }
}
```
::expected
```
1
true
```
::checks
- equals ET hashCode redéfinis
- hashCode cohérent avec equals
::hint
Signature : `public boolean equals(Object o)`.
---
`Objects.hash(x, y)` calcule un hashCode à partir des champs.
::explanation
Contrat : deux objets égaux doivent avoir le même `hashCode()`. Sans `hashCode()`, le `HashSet` ne voit pas les doublons.
