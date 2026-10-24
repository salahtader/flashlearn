---
id: java-u12-concurrence
subject: Java
level: 3
order: 13
title: Concurrence
description: Threads, executors, atomicité, deadlock, CompletableFuture
language: fr
tags: java, parcours
---
# Concurrence

> **Objectif** : lancer des tâches en parallèle sans corrompre les données partagées.

## 1. Un modèle différent de JavaScript

JavaScript exécute ton code sur **un seul thread** avec une boucle d'événements. Java a de vrais **threads** qui s'exécutent en parallèle et **partagent la mémoire** : ce qui est pratique, mais source de bugs de visibilité et d'atomicité.

```java
Thread t = new Thread(() -> System.out.println("dans " + Thread.currentThread().getName()));
t.start();     // démarre un nouveau thread
t.join();      // attend sa fin
```

> **Piège** : `t.run()` exécute le code dans le thread **courant**. Seul `start()` crée un thread.

## 2. `ExecutorService` : ne gère pas les threads à la main

```java
try (ExecutorService pool = Executors.newFixedThreadPool(4)) {   // AutoCloseable depuis Java 19
    Future<Integer> f = pool.submit(() -> 6 * 7);                 // Callable
    System.out.println(f.get());                                  // 42 (get() attend le résultat)
}
```

| | `Runnable` | `Callable<V>` |
|---|---|---|
| Méthode | `run()` | `call()` |
| Retourne | rien | une valeur |
| Exception *checked* | non | oui |

Sans `shutdown()` (ou le `try-with-resources` ci-dessus), les threads du pool empêchent la JVM de s'arrêter.

## 3. La course critique (*race condition*)

`count++` n'est **pas atomique** : c'est lecture, calcul, écriture. Deux threads peuvent lire la même valeur et perdre un incrément.

```java
class Compteur {
    int n = 0;
    void inc() { n++; }      // non thread-safe
}
// 2 threads × 100 000 appels de inc() donnent souvent moins de 200 000
```

Trois corrections :

```java
class CompteurSync   { private int n; synchronized void inc() { n++; } }   // exclusion mutuelle
class CompteurAtomic { private final AtomicInteger n = new AtomicInteger(); void inc() { n.incrementAndGet(); } }
class CompteurAdder  { private final LongAdder n = new LongAdder(); void inc() { n.increment(); } }   // forte contention
```

## 4. `volatile` et `synchronized`

| | Visibilité | Exclusion mutuelle | Atomicité de `n++` |
|---|---|---|---|
| `volatile` | oui | non | non |
| `synchronized` | oui | oui | oui (dans le bloc) |
| `AtomicInteger` | oui | non (sans verrou) | oui |

`volatile` convient pour un **drapeau** (`volatile boolean arret`) lu par un thread et écrit par un autre. Il ne suffit pas pour une opération composée.

## 5. Deadlock

Deux threads s'attendent mutuellement : chacun détient un verrou et attend celui de l'autre.

```java
// Thread 1 : verrouille A puis B
// Thread 2 : verrouille B puis A     → blocage définitif possible
```

Il faut quatre conditions réunies : **exclusion mutuelle**, **détention et attente**, **pas de préemption**, **attente circulaire**. Prévention : acquérir les verrous toujours dans le **même ordre**, utiliser `tryLock` avec délai, réduire la portée des verrous.

## 6. `CompletableFuture`

Équivalent des `Promise` JavaScript : composition asynchrone sans bloquer.

```java
CompletableFuture<String> f = CompletableFuture.supplyAsync(() -> "Ada")
    .thenApply(String::toUpperCase)                                                    // ~ then
    .thenCombine(CompletableFuture.supplyAsync(() -> 36), (nom, age) -> nom + " " + age)
    .exceptionally(e -> "erreur");
System.out.println(f.join());    // ADA 36
```

`thenCompose` enchaîne une autre tâche asynchrone (comme un `then` qui renvoie une `Promise`). Par défaut `supplyAsync` utilise le `ForkJoinPool` commun : passe ton propre `Executor` pour des appels bloquants (I/O).

## 7. Threads virtuels (Java 21)

Des threads très légers, gérés par la JVM : adaptés à des milliers de tâches **bloquantes** (réseau, base de données).

```java
try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 1000; i++) pool.submit(() -> appelReseau());
}
```

## Erreurs fréquentes
- Appeler `run()` au lieu de `start()`.
- Partager un objet mutable sans protection.
- Croire que `volatile` rend `n++` atomique.
- Oublier d'arrêter l'`ExecutorService`.
- Prendre des verrous dans des ordres différents.

## À retenir
- Threads = mémoire partagée : visibilité et atomicité sont ton problème.
- `ExecutorService` plutôt que `new Thread`.
- `AtomicInteger`, `synchronized` ou `LongAdder` pour les compteurs.
- `volatile` : visibilité seulement. `synchronized` : visibilité et exclusion mutuelle.
- `CompletableFuture` pour composer des tâches asynchrones.

@@ card conc-002 medium
::question
`Runnable` vs `Callable` ?
::answer
`Runnable.run()` ne retourne rien et ne peut pas lever d'exception *checked*. `Callable<V>.call()` retourne une valeur et peut lever une exception *checked* ; on récupère le résultat via un `Future`.
::explanation
On soumet les deux à un `ExecutorService` plutôt que de créer des `Thread` à la main.

@@ card conc-003 medium
::question
Comment utiliser correctement un `ExecutorService` ?
::answer
Créer un pool (`Executors.newFixedThreadPool(n)`, ou `newVirtualThreadPerTaskExecutor()` depuis Java 21 pour les tâches bloquantes), soumettre des tâches, puis toujours l'arrêter avec `shutdown()`.
::explanation
Sans `shutdown()`, les threads non daemon empêchent la JVM de s'arrêter. Java 19+ : `ExecutorService` implémente `AutoCloseable` (try-with-resources).

@@ card conc-005 hard
::question
Pourquoi cette classe n'est-elle pas thread-safe, et comment la corriger ?

```java
class Counter {
    private int count = 0;
    void inc() { count++; }
    int get() { return count; }
}
```
::answer
`count++` n'est **pas atomique** (lecture, modification, écriture) : des incréments se perdent. Corrections : `AtomicInteger.incrementAndGet()`, une méthode `synchronized`, ou `LongAdder` en forte contention.
::explanation
`volatile` ne suffit pas : il garantit la visibilité, pas l'atomicité d'une opération composée.
::hint
`count++` se décompose en combien d'opérations ?

@@ card conc-001 hard
::question
`volatile` vs `synchronized` ?
::answer
`volatile` garantit la **visibilité** (et l'ordre) des écritures entre threads, sans exclusion mutuelle ni atomicité des opérations composées (`i++`). `synchronized` garantit exclusion mutuelle **et** visibilité.
::hint
Lequel des deux garantit aussi l'exclusion mutuelle ?

@@ card conc-004 hard
::question
Quelles sont les conditions d'un *deadlock* et comment l'éviter ?
::answer
Quatre conditions réunies : **exclusion mutuelle**, **détention et attente**, **pas de préemption**, **attente circulaire**. Prévention : ordre global d'acquisition des verrous, `tryLock` avec délai, réduire la portée des verrous.

@@ card conc-006 hard
::question
`CompletableFuture` : à quoi servent `thenApply`, `thenCompose`, `thenCombine` et `exceptionally` ?
::answer
`thenApply` : transforme le résultat. `thenCompose` : enchaîne une autre tâche asynchrone (aplatit). `thenCombine` : combine deux futures indépendants. `exceptionally` : gère l'erreur et fournit une valeur de repli.
::explanation
Analogue de `map` / `flatMap` pour `thenApply` / `thenCompose`. `supplyAsync` utilise le `ForkJoinPool.commonPool()` par défaut : fournir son propre `Executor` pour les I/O bloquantes.

@@ quiz n-start easy
::question
Quelle méthode démarre réellement un nouveau thread ?
::choices
- [ ] run()
- [x] start()
- [ ] execute()
- [ ] join()
::explanation
`start()`. Appeler `run()` exécute simplement le code dans le thread courant.

@@ quiz n-atom hard
::question
Lesquelles garantissent qu'aucun incrément de `compteur++` n'est perdu entre threads ?
::choices
- [ ] volatile int compteur
- [x] une méthode synchronized
- [x] AtomicInteger.incrementAndGet()
- [ ] un int sans protection
::explanation
`synchronized` (exclusion mutuelle) et `AtomicInteger` (opération atomique). `volatile` garantit la visibilité, pas l'atomicité.
::hint
`n++` est lecture, calcul, écriture.

@@ quiz n-call medium
::question
Qu'est-ce qui distingue un `Callable<V>` d'un `Runnable` ?
::choices
- [x] Il retourne une valeur et peut lever une exception checked
- [ ] Il s'exécute plus vite
- [ ] Il ne s'exécute que sur le thread principal
- [ ] Il n'a pas besoin d'ExecutorService
::explanation
`call()` retourne un `V` (récupéré via un `Future`) et peut déclarer des exceptions *checked*.

@@ exercise e-conc medium Compteur thread-safe
::question
Quatre tâches incrémentent 25 000 fois un compteur partagé. Rends le comptage correct : le total doit toujours valoir 100000. Attention : le code de départ peut afficher 100000 par chance. Ce qui compte, c'est qu'il soit correct **à chaque exécution**.
::starter
```java
import java.util.concurrent.*;

public class Main {
    static int compteur = 0;   // TODO : rends le comptage thread-safe

    public static void main(String[] args) {
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            for (int t = 0; t < 4; t++) {
                pool.submit(() -> {
                    for (int i = 0; i < 25_000; i++) compteur++;
                });
            }
        }
        System.out.println("Total = " + compteur);
    }
}
```
::solution
```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final AtomicInteger compteur = new AtomicInteger();

    public static void main(String[] args) {
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            for (int t = 0; t < 4; t++) {
                pool.submit(() -> {
                    for (int i = 0; i < 25_000; i++) compteur.incrementAndGet();
                });
            }
        }
        System.out.println("Total = " + compteur.get());
    }
}
```
::expected
```
Total = 100000
```
::checks
- Le résultat doit être identique à chaque exécution
- Pas de verrou global inutile
::hint
`AtomicInteger` offre `incrementAndGet()`.
---
Remplace `compteur++` et la lecture finale par les méthodes de l'`AtomicInteger`.
::explanation
`compteur++` n'est pas atomique : sans protection, des incréments se perdent. `AtomicInteger` rend l'opération atomique sans verrou. `synchronized` aurait aussi convenu. Le `try-with-resources` attend la fin des tâches avant d'afficher.
