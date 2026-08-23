# Алгебраическая модель блога

## Сущности

Пусть `Id` — стабильный, язык-независимый идентификатор в `kebab-case`.

```text
Publication = Note | Synthesis
Synthesis   = CaseStudy | Essay
Collection  = Project | ResearchThread
Artifact    = Image | Diagram | Prototype | Demo | Repository | Data | OtherEvidence
```

- `Note` — атомарная опубликованная находка, решение, эксперимент, изменение
  модели или точно сформулированный вопрос.
- `Project` — страница живой линии вокруг создаваемого или исследуемого
  объекта. Это не синоним продукта, компании или папки в репозитории.
- `ResearchThread` — страница повторяющегося вопроса, метода или способа
  исследования, который может пересекать проекты или существовать без них.
- `CaseStudy` — ретроспективный синтез завершённого участка траектории.
- `Essay` — синтез наблюдений, не обязанный описывать один проект.
- `Artifact` — проверяемое свидетельство или результат работы; сам по себе он
  не обязан быть публикацией.

`Tag` остаётся свободной вспомогательной меткой. Он не является ни проектом,
ни исследовательской линией и не создаёт структурную страницу.

## Отношения

```text
Note        --belongsTo?--> Project[0..n]
Note        --continues?--> ResearchThread[0..n]
Publication --uses--------> Artifact[0..n]
Synthesis   --synthesizes-> Publication[0..n]
Project     --hasQuestion--> OpenQuestion[1]
ResearchThread --hasScope--> Scope[1]
```

Связь хранится на стороне публикации (`projects`, `threads`, `artifacts`,
`synthesizes`). Страницы проектов и линий выводят связанные публикации из этих
отношений; они не содержат вручную дублируемый список заметок.

Одна заметка может не иметь ни одного `Project` и ни одного `ResearchThread`.
Это нормальный случай, а не незаполненное поле.

## Жизненный цикл и публикация

`draft` и `published` описывают доступность конкретной страницы. Они не равны
статусу проекта.

```text
Project state:        incubating | active | paused | archived
Project visibility:   unlisted | listed | featured
Thread state:         candidate | promoted | archived
```

- `candidate` у линии существует только как ключ в `threads` у заметки и
  выглядит как обычная метка.
- `promoted` означает, что появилась собственная страница линии.
- `unlisted` у проекта допускает страницу по прямой ссылке, но исключает её из
  индексов и блоков главной. `listed` — обычная видимость; `featured` —
  осознанное ручное выделение.

## Локализация

Переводы одной логической сущности используют одинаковый `id` и
`translationKey`; идентификаторы отношений всегда ссылаются на этот общий
`id`, а не на локализованный URL. Связанные материалы показываются только в
текущем языке. Отсутствующий перевод не подменяется текстом другого языка без
явного решения в интерфейсе.

## Множество видимых страниц

Для языка `L`:

```text
Notes(L)       = published Note в L, в обратном хронологическом порядке
Projects(L)    = published Project в L с visibility ∈ {listed, featured}
Threads(L)     = published ResearchThread в L с state = promoted
CaseStudies(L) = published CaseStudy в L
Essays(L)      = published Essay в L
Home(L)        = последние Publications(L) + ограниченные выборки Projects(L), Threads(L)
```

Следовательно, страница или ссылка не появляется только потому, что в заметке
впервые написан новый ключ проекта или линии.
