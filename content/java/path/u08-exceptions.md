---
id: java-u08-exceptions
subject: Java
level: 2
order: 8
title: Exceptions
description: checked/unchecked, try-with-resources, finally
language: fr
tags: java, parcours
---
# Exceptions

> **Objectif** : choisir le bon type d'exception, gérer les ressources proprement et écrire du code d'erreur lisible.

## 1. La hiérarchie

```text
Throwable
├── Error                  (OutOfMemoryError, StackOverflowError : on ne les attrape pas)
└── Exception
    ├── IOException, SQLException…   → CHECKED : à déclarer (throws) ou capturer
    └── RuntimeException             → UNCHECKED : sans obligation
        ├── NullPointerException
        ├── IllegalArgumentException
        └── IllegalStateException
```

- **Checked** : le compilateur t'oblige à traiter l'erreur. À utiliser quand l'appelant peut raisonnablement réagir (fichier absent, réseau).
- **Unchecked** : erreur de programmation ou situation irrécupérable (argument invalide, `null` inattendu).

## 2. `try`, `catch`, `finally`

```java
try {
    String texte = Files.readString(Path.of("data.txt"));
    int n = Integer.parseInt(texte.trim());
} catch (NoSuchFileException e) {
    System.out.println("Fichier absent : " + e.getMessage());
} catch (IOException | NumberFormatException e) {   // multi-catch
    System.out.println("Problème : " + e);
} finally {
    System.out.println("toujours exécuté");
}
```

Place les `catch` du plus **spécifique** au plus général. Un `finally` s'exécute toujours, mais un `return` dans un `finally` **écrase** celui du `try` et masque toute exception : à proscrire.

```java
static int f() {
    try { return 1; }
    finally { return 2; }   // f() retourne 2
}
```

## 3. `try-with-resources`

Toute ressource `AutoCloseable` déclarée dans les parenthèses est fermée automatiquement, même en cas d'erreur, dans l'ordre **inverse** de leur déclaration.

```java
try (var in = Files.newBufferedReader(Path.of("data.txt"));
     var out = Files.newBufferedWriter(Path.of("copie.txt"))) {
    String ligne;
    while ((ligne = in.readLine()) != null) {
        out.write(ligne);
        out.newLine();
    }
}   // out.close() puis in.close(), automatiquement
```

## 4. Lever et créer ses exceptions

```java
class SoldeInsuffisantException extends Exception {
    SoldeInsuffisantException(String message) { super(message); }
}

void retirer(double montant) throws SoldeInsuffisantException {
    if (montant > solde) throw new SoldeInsuffisantException("Il manque " + (montant - solde));
    solde -= montant;
}
```

Valide les arguments tôt : `Objects.requireNonNull(x, "x ne doit pas être null")` ou `throw new IllegalArgumentException(...)`.

**Conserve la cause** quand tu transformes une exception :

```java
try { lire(); }
catch (IOException e) { throw new ServiceException("Lecture impossible", e); }   // e = la cause
```

## 5. Bonnes pratiques

- Capture le type **le plus précis** possible, jamais `catch (Exception e) {}` vide.
- Ne logue pas **et** ne relance pas la même exception : tu obtiens des doublons dans les logs.
- N'utilise pas les exceptions pour le flux normal (ex. sortir d'une boucle).
- Un message utile dit **quoi** et **avec quelles valeurs**.

## Erreurs fréquentes
- Avaler une exception sans rien faire.
- Capturer `Exception` ou `Throwable` trop large.
- Oublier de fermer une ressource (utilise `try-with-resources`).
- Perdre la cause d'origine en créant une nouvelle exception sans la chaîner.

## À retenir
- Checked : l'appelant peut réagir. Unchecked : erreur de programmation.
- `try-with-resources` ferme tout, dans l'ordre inverse.
- `finally` s'exécute toujours ; pas de `return` dedans.
- Chaîne toujours la cause avec `new MonException("msg", cause)`.
- Ne confonds pas `final` (modificateur), `finally` (bloc) et `finalize()` (ancien, déprécié).

@@ card exc-001 easy
::question
Exceptions *checked* vs *unchecked* ?
::answer
*Checked* : sous-classes de `Exception` hors `RuntimeException`, à déclarer ou capturer. *Unchecked* : `RuntimeException` et `Error`, sans obligation.

@@ card kw-001 easy
::question
`final`, `finally`, `finalize` : différences ?
::answer
`final` : modificateur (constante, méthode non redéfinissable, classe non héritable). `finally` : bloc exécuté après `try/catch`. `finalize()` : ancienne méthode de nettoyage, dépréciée.

@@ card exc-002 medium
::question
Que garantit ce `try-with-resources` ?

```java
try (var in = Files.newBufferedReader(path)) {
    return in.readLine();
}
```
::answer
`close()` est appelé automatiquement, même en cas d'exception, car la ressource implémente `AutoCloseable`.
::explanation
Avec plusieurs ressources, la fermeture se fait dans l'ordre inverse de leur déclaration.
::hint
Quelle interface la ressource doit-elle implémenter ?

@@ card exc-004 medium
::question
Comment bien concevoir et chaîner des exceptions personnalisées ?
::answer
Étendre `Exception` (*checked*) si l'appelant peut raisonnablement réagir, `RuntimeException` sinon. Toujours conserver la cause : `throw new MyException("message", cause);`.
::explanation
Éviter de capturer `Exception`/`Throwable` trop largement et de logger puis relancer la même exception (doublons dans les logs).

@@ card exc-003 hard
::question
Que retourne cette méthode ?

```java
static int f() {
    try { return 1; }
    finally { return 2; }
}
```
::answer
`2`
::explanation
Le `return` du `finally` **écrase** celui du `try` (et masque toute exception en cours). À proscrire.
::hint
Lequel des deux `return` est exécuté en dernier ?

@@ quiz n-chk medium
::question
Laquelle de ces exceptions est **checked** ?
::choices
- [ ] NullPointerException
- [x] IOException
- [ ] IllegalArgumentException
- [ ] ArithmeticException
::explanation
`IOException` étend `Exception` sans passer par `RuntimeException` : il faut la déclarer (`throws`) ou la capturer. Les trois autres sont des `RuntimeException`.
::hint
Les exceptions *checked* sont celles que le compilateur t'oblige à traiter.

@@ quiz n-ord medium
::question
Un `try-with-resources` déclare la ressource `a` puis la ressource `b`. Dans quel ordre sont-elles fermées ?
::choices
- [ ] a puis b
- [x] b puis a
- [ ] en parallèle
- [ ] ordre indéterminé
::explanation
Dans l'ordre **inverse** de la déclaration : `b.close()` puis `a.close()`, comme une pile.

@@ exercise e-exc medium Exception personnalisée
::question
Complète `SoldeInsuffisantException` et `retirer` : si le montant dépasse le solde, lève l'exception avec le message `Solde insuffisant : il manque X`.
::starter
```java
class SoldeInsuffisantException extends Exception {
    // TODO : constructeur avec message
}

class Compte {
    double solde = 100;

    void retirer(double montant) throws SoldeInsuffisantException {
        // TODO
    }
}

public class Main {
    public static void main(String[] args) {
        try {
            new Compte().retirer(130);
        } catch (SoldeInsuffisantException e) {
            System.out.println(e.getMessage());
        }
    }
}
```
::solution
```java
class SoldeInsuffisantException extends Exception {
    SoldeInsuffisantException(String message) { super(message); }
}

class Compte {
    double solde = 100;

    void retirer(double montant) throws SoldeInsuffisantException {
        if (montant > solde) {
            throw new SoldeInsuffisantException("Solde insuffisant : il manque " + (montant - solde));
        }
        solde -= montant;
    }
}

public class Main {
    public static void main(String[] args) {
        try {
            new Compte().retirer(130);
        } catch (SoldeInsuffisantException e) {
            System.out.println(e.getMessage());
        }
    }
}
```
::expected
```
Solde insuffisant : il manque 30.0
```
::checks
- L'exception est checked (extends Exception)
- Le message passe par super(message)
::hint
Le constructeur appelle `super(message)`.
---
`throw new SoldeInsuffisantException(...)`.
