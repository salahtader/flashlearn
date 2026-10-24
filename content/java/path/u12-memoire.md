---
id: java-u11-memoire
subject: Java
level: 3
order: 12
title: Mémoire, JVM et HashMap
description: Stack/heap, GC, fuites, internals de HashMap
language: fr
tags: java, parcours
---
# Mémoire, JVM et structures internes

> **Objectif** : comprendre où vivent les données, comment la mémoire est libérée et comment `HashMap` fonctionne.

## 1. De `.java` à l'exécution

```text
Main.java ──javac──▶ Main.class (bytecode) ──JVM──▶ exécution
                                             ├─ chargeur de classes
                                             ├─ interpréteur + compilateur JIT
                                             └─ garbage collector
```

- **JDK** = JRE + outils (`javac`, `jar`, `jlink`…). **JRE** = JVM + bibliothèques standard. **JVM** = machine virtuelle qui exécute le bytecode.
- Le bytecode est portable : « compile une fois, exécute partout ». Le compilateur **JIT** transforme à chaud les parties les plus utilisées en code natif.

## 2. Stack et heap

![Stack et heap : les primitifs dans la frame, les objets sur la heap](./img/stack-heap.svg)

- **Stack** : une pile **par thread**. Chaque appel de méthode crée une *frame* (variables locales, références). Elle disparaît au retour de la méthode.
- **Heap** : mémoire **partagée** où vivent tous les objets. Gérée par le garbage collector.

```java
void f() {
    int age = 30;                              // primitif : dans la frame
    Personne p = new Personne("Ada", 36);      // p (référence) sur la stack, l'objet sur la heap
}   // la frame disparaît ; l'objet devient libérable s'il n'a plus de référence
```

Erreurs liées : `StackOverflowError` = récursion trop profonde ; `OutOfMemoryError` = heap saturée.

## 3. Le garbage collector

Un objet est libérable quand il n'est plus **accessible** depuis les *GC roots* (variables locales des threads actifs, champs statiques…). Les collecteurs modernes sont **générationnels** : la plupart des objets meurent jeunes, donc la *jeune génération* est nettoyée souvent et rapidement, et la *génération ancienne* plus rarement. Le collecteur par défaut est **G1**.

```java
String s = new String("temp");
s = null;       // l'objet n'est plus référencé : éligible à la collecte (pas supprimé immédiatement)
```

Tu ne contrôles pas le moment de la collecte : `System.gc()` n'est qu'une suggestion. Règle la taille de la heap avec `-Xms` et `-Xmx` (ex. `java -Xmx512m Main`).

## 4. Fuites de mémoire en Java

Java n'a pas de fuite « classique », mais tu peux garder des références **sans le vouloir** :

- une collection **statique** qui grossit (cache sans limite) ;
- un *listener* ou *callback* jamais désenregistré ;
- un `ThreadLocal` non nettoyé dans un *thread pool* ;
- une classe **interne** non statique, qui garde une référence vers l'instance externe.

## 5. Le pool de chaînes

Les littéraux `"abc"` sont internés : deux littéraux identiques pointent vers le même objet. C'est pourquoi `"abc" == "abc"` est `true`, alors que `new String("abc") == "abc"` est `false`. Compare toujours avec `equals()`.

## 6. `HashMap` en interne

```text
table[0] → null
table[1] → (clé, valeur) → (clé, valeur)        ← collision : liste chaînée
table[2] → arbre rouge-noir                       ← si ≥ 8 éléments dans un bucket
...
```

1. L'index du *bucket* vient de `hashCode()` de la clé.
2. Dans le bucket, `equals()` distingue les clés qui sont en collision.
3. Un bucket qui dépasse **8** éléments (si la table compte au moins **64** cases) devient un **arbre rouge-noir**.
4. Quand le remplissage dépasse **0,75**, la table **double** et tout est redistribué.

D'où l'importance d'un bon `hashCode()` et de clés **immuables**.

## Erreurs fréquentes
- Croire que `= null` libère immédiatement la mémoire.
- Mettre un cache dans un champ `static` sans le borner.
- Utiliser un objet mutable comme clé de `HashMap`.
- Confondre `StackOverflowError` (récursion) et `OutOfMemoryError` (heap).

## À retenir
- Stack : frames et références. Heap : objets.
- Libérable = plus accessible depuis les GC roots.
- Fuite Java = référence oubliée (static, listener, ThreadLocal).
- `HashMap` : buckets, collisions chaînées puis arbre, redimensionnement à 75 %.

@@ card jvm-001 easy
::question
JDK, JRE, JVM : quelle différence ?
::answer
**JVM** : machine virtuelle qui exécute le bytecode. **JRE** : JVM et bibliothèques standard. **JDK** : JRE et outils de développement (`javac`, `jar`, `jlink`…).
::explanation
Depuis Java 11, Oracle ne distribue plus de JRE séparé ; on utilise le JDK ou une image runtime créée avec `jlink`.

@@ card mem-001 easy
::question
Quelle différence entre la *stack* et la *heap* ?
::answer
**Stack** : une pile par thread, contient les frames (variables locales, références), libérée à la sortie de méthode. **Heap** : mémoire partagée où vivent tous les objets, gérée par le garbage collector.
::explanation
Un `StackOverflowError` vient d'une récursion trop profonde, un `OutOfMemoryError` d'une heap saturée.

@@ card mem-002 medium
::question
Comment le *garbage collector* décide-t-il qu'un objet peut être libéré ?
::answer
Quand l'objet n'est plus **accessible** depuis les *GC roots* (variables locales des threads, champs statiques, etc.). Les GC sont généralement **générationnels** : jeune génération (collectes fréquentes) et ancienne génération.
::explanation
Un objet référencé par erreur reste vivant : c'est ce qu'on appelle une fuite mémoire en Java.

@@ quiz mem-003 medium
::question
Lesquels peuvent provoquer une fuite mémoire en Java ?
::choices
- [x] Une collection statique qui accumule des objets
- [x] Un listener jamais désenregistré
- [ ] Une variable locale dans une méthode
- [x] Un ThreadLocal non nettoyé dans un thread pool
::answer
Une collection statique qui grossit, un *listener* jamais désenregistré et un `ThreadLocal` non nettoyé dans un *thread pool*.
::explanation
Une variable locale est libérée à la fin de la méthode : elle ne fuit pas.
::hint
Cherche ce qui garde une référence vivante trop longtemps.

@@ card col-003 hard
::question
Comment fonctionne `HashMap` en interne ?
::answer
Un tableau de *buckets*. L'index vient du `hashCode()` de la clé. Les collisions sont chaînées (liste), transformée en **arbre rouge-noir** à partir de 8 éléments dans un bucket (si la table a au moins 64 cases). Le tableau double quand le taux de remplissage dépasse **0,75**.
::explanation
D'où l'importance d'un bon `hashCode()` et de clés immuables.
::hint
Que se passe-t-il quand un même bucket dépasse 8 éléments ?

@@ quiz n-heap easy
::question
Où vit un objet créé avec `new` ?
::choices
- [ ] Sur la stack
- [x] Sur la heap
- [ ] Dans un registre du processeur
- [ ] Dans le pool de chaînes uniquement
::explanation
Sur la **heap**. La variable qui le référence peut, elle, être sur la stack (variable locale).

@@ quiz n-so medium
::question
Quelle erreur signale une récursion sans fin ?
::choices
- [ ] OutOfMemoryError
- [x] StackOverflowError
- [ ] ArithmeticException
- [ ] ClassCastException
::explanation
`StackOverflowError` : la pile du thread est saturée de frames. `OutOfMemoryError` concerne la heap.

@@ exercise e-lru hard Cache borné (LRU)
::question
Un cache sans limite finit par fuir de la mémoire. Complète `CacheLru` pour qu'il supprime l'entrée la moins récemment utilisée quand sa taille dépasse la capacité.
::starter
```java
import java.util.*;

class CacheLru<K, V> extends LinkedHashMap<K, V> {
    private final int capacite;

    CacheLru(int capacite) {
        super(16, 0.75f, true);   // true : l'ordre suit les accès
        this.capacite = capacite;
    }
    // TODO : supprime la plus ancienne entrée quand size() > capacite
}

public class Main {
    public static void main(String[] args) {
        CacheLru<String, Integer> cache = new CacheLru<>(2);
        cache.put("a", 1);
        cache.put("b", 2);
        cache.get("a");
        cache.put("c", 3);
        System.out.println(cache.keySet());
    }
}
```
::solution
```java
import java.util.*;

class CacheLru<K, V> extends LinkedHashMap<K, V> {
    private final int capacite;

    CacheLru(int capacite) {
        super(16, 0.75f, true);
        this.capacite = capacite;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacite;
    }
}

public class Main {
    public static void main(String[] args) {
        CacheLru<String, Integer> cache = new CacheLru<>(2);
        cache.put("a", 1);
        cache.put("b", 2);
        cache.get("a");
        cache.put("c", 3);
        System.out.println(cache.keySet());
    }
}
```
::expected
```
[a, c]
```
::checks
- Redéfinis removeEldestEntry
- Retourne true quand la taille dépasse la capacité
::hint
`LinkedHashMap` appelle `removeEldestEntry` après chaque `put`.
---
`return size() > capacite;`
::explanation
Avec l'ordre d'accès, `get("a")` rend `a` plus récent que `b` : c'est donc `b` qui est supprimé à l'ajout de `c`. Un cache borné évite la fuite de mémoire d'une collection qui grossit sans fin.
