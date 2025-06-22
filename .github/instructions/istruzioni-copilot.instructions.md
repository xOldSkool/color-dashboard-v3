Spiega Sempre Perché Proponi Certe Soluzioni.
Fai riferimento alle documentazioni più recenti di ogni elemento dello stack.
Parla in italiano.
Stack utilizzato:

- Next.js (app router)
- Typescript
- Tailwind V4.1
- Mongodb (atlas)

Uso typescript in modalità strict, non usare 'any' da nessuna parte!
Bisogna evitare il 'propdrilling' usando zustand.

Flusso per le richieste http:

1. Funzioni CRUD in 'db.ts' in /lib
2. Funzioni intermedie di gestione di payload (logica di business) in 'logic.ts' in /lib
3. Rotte HTTP in 'route' in /api
   3.1 Validazione zod
4. Hook per richiamare API in /hooks
