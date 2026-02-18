# Testing Guide - TODO App

Acest ghid descrie cum sa rulezi si sa intretii suite-ul complet de teste pentru aplicatia TODO.

---

## Structura Testelor

```
tests/
├── setup.js                          # Configurare globala pentru Vitest
├── unit/                             # Unit tests (Vitest + RTL)
│   ├── TodoItem.test.jsx            # 10 teste
│   ├── TodoForm.test.jsx            # 18 teste
│   ├── TodoList.test.jsx            # 8 teste
│   └── App.test.jsx                 # 24 teste
├── functional/                       # Functional tests (Playwright)
│   ├── crud-operations.spec.js      # 20 teste
│   ├── state-management.spec.js     # 15 teste
│   └── persistence.spec.js          # 18 teste
└── acceptance/                       # Acceptance tests (Playwright E2E)
    ├── user-journey.spec.js         # 8 scenarii
    ├── task-management.spec.js      # 7 scenarii
    └── edge-cases.spec.js           # 20 teste

Total: 148+ teste
```

---

## Instalare Dependinte

### Prima data (dupa clonare)

```bash
# Instaleaza toate dependintele
npm install

# Instaleaza browser-ele pentru Playwright
npm run playwright:install
```

---

## Rulare Teste

### Unit Tests (Vitest)

```bash
# Ruleaza toate unit tests
npm run test:unit

# Ruleaza in watch mode (recomandat pentru development)
npm run test:unit -- --watch

# Ruleaza cu UI interactiv
npm run test:unit:ui

# Genereaza coverage report
npm run test:unit:coverage
```

**Durata**: ~5-10 secunde  
**Cand**: La fiecare commit, in timpul development-ului

### Functional Tests (Playwright)

```bash
# Ruleaza functional tests
npm run test:functional
```

**Durata**: ~30-60 secunde  
**Cand**: Inainte de merge la main branch

### Acceptance Tests (Playwright)

```bash
# Ruleaza acceptance tests
npm run test:acceptance
```

**Durata**: ~1-2 minute  
**Cand**: Inainte de release

### Toate Testele E2E (Functional + Acceptance)

```bash
# Ruleaza toate testele Playwright
npm run test:e2e
```

### Toate Testele (Unit + E2E)

```bash
# Ruleaza intregul suite de teste
npm run test:all
```

**Durata**: ~2-3 minute  
**Cand**: Inainte de deployment

---

## Categorii de Teste

### 1. Unit Tests (60+ teste)

**Scop**: Testare componente izolate, functii pure

**Coverage**:
- `TodoItem.test.jsx` - rendering, events, CSS classes
- `TodoForm.test.jsx` - add mode, edit mode, validation
- `TodoList.test.jsx` - list rendering, empty state
- `App.test.jsx` - CRUD operations, statistics, localStorage

**Exemple**:
```bash
# Ruleaza doar un fisier
npm run test:unit -- TodoItem.test.jsx

# Ruleaza teste care contin "delete" in nume
npm run test:unit -- -t delete
```

### 2. Functional Tests (53+ teste)

**Scop**: Testare flow-uri complete de functionalitate

**Coverage**:
- `crud-operations.spec.js` - CREATE, READ, UPDATE, DELETE flows
- `state-management.spec.js` - statistics, edit mode, visual state
- `persistence.spec.js` - localStorage save/load, data integrity

**Exemple**:
```bash
# Ruleaza doar CRUD tests
npx playwright test tests/functional/crud-operations.spec.js

# Ruleaza cu UI mode (debug)
npx playwright test tests/functional --ui
```

### 3. Acceptance Tests (35+ teste)

**Scop**: Validare scenarii end-to-end din perspectiva user-ului

**Coverage**:
- `user-journey.spec.js` - first-time user, returning user, power user
- `task-management.spec.js` - daily workflows, realistic usage
- `edge-cases.spec.js` - validation, rapid actions, error handling

**Exemple**:
```bash
# Ruleaza doar user journey tests
npx playwright test tests/acceptance/user-journey.spec.js

# Ruleaza cu headed mode (vezi browser-ul)
npx playwright test tests/acceptance --headed
```

---

## Debugging Teste

### Unit Tests (Vitest)

```bash
# UI mode - cel mai usor pentru debugging
npm run test:unit:ui

# Watch mode cu filter
npm run test:unit -- --watch --reporter=verbose
```

### E2E Tests (Playwright)

```bash
# UI mode - step-through debugging
npx playwright test --ui

# Headed mode - vezi browser-ul
npx playwright test --headed

# Debug mode - pause la fiecare actiune
npx playwright test --debug

# Ruleaza doar teste failed
npx playwright test --last-failed
```

### Playwright Trace Viewer

Daca un test esueaza, Playwright salveaza automat trace:

```bash
# Deschide trace viewer
npx playwright show-report
```

---

## CI/CD Integration

### Recomandat Workflow

```yaml
# .github/workflows/test.yml (exemplu)
- name: Install dependencies
  run: npm install

- name: Install Playwright browsers
  run: npm run playwright:install

- name: Run unit tests
  run: npm run test:unit -- --run

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

### Optimizari pentru CI

- Unit tests ruleaza mereu (fast feedback)
- Functional tests doar pe PR-uri
- Acceptance tests doar pe main branch
- Parallel execution pentru Playwright

---

## Coverage

### Vizualizare Coverage

```bash
# Genereaza coverage report
npm run test:unit:coverage

# Deschide in browser
# Coverage report: coverage/index.html
```

### Target Coverage

- **Unit tests**: 80%+ line coverage
- **Critical paths**: 100% coverage (CRUD operations)
- **Edge cases**: Covered in acceptance tests

---

## Best Practices

### Cand sa rulezi ce teste

**Local Development**:
- Unit tests in watch mode: `npm run test:unit -- --watch`
- Feedback instant la modificari

**Inainte de Commit**:
- Unit tests: `npm run test:unit`
- Verifica ca nu ai spart nimic

**Inainte de PR**:
- Toate testele: `npm run test:all`
- Asigura-te ca totul functioneaza

**Inainte de Deploy**:
- Full suite + coverage: `npm run test:all && npm run test:unit:coverage`
- Verifica calitatea codului

### Scrierea de Teste Noi

**Unit tests**:
- Pune in `tests/unit/`
- Foloseste naming: `ComponentName.test.jsx`
- Testeaza comportament, nu implementare

**Functional tests**:
- Pune in `tests/functional/`
- Foloseste naming: `feature-name.spec.js`
- Testeaza flow-uri complete

**Acceptance tests**:
- Pune in `tests/acceptance/`
- Foloseste naming: `scenario-name.spec.js`
- Testeaza din perspectiva user-ului

---

## Troubleshooting

### "Playwright browsers not installed"

```bash
npm run playwright:install
```

### "Port 5173 already in use"

```bash
# Opreste dev server-ul existent
# Sau schimba portul in vite.config.js
```

### "Tests timeout"

```bash
# Creste timeout in playwright.config.js
timeout: 60000  # 60 secunde
```

### "localStorage is not defined"

Verifica ca `tests/setup.js` este configurat corect in `vitest.config.js`.

---

## Resurse Utile

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
