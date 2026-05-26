# Rails-side cell renderers/editors + multiple grids per model

Grounded in `gem/stimulus_grid_rails/docs/REFERENCE.md` and the gem source.

## Defining renderers & editors from Rails

Two layers — column-level config (server picks editor by `type:`) and custom
HTML `<template>` elements referenced by id.

### 1. Built-in editors (no work needed)

Set `type:` and `editable: true`; the base grid picks the right input.

```ruby
column :name,    type: :string,  editable: true
column :age,     type: :integer, editable: true
column :sport,   type: :enum,    editable: true, enum_values: %w[running cycling]
column :joined,  type: :date,    editable: true
column :price,   type: :money,   editable: true
```

Tweak via:

- `editor_config:` → serialized into `data-editor-config` on the cell.
- `editor:` → informational key (base grid still chooses input by `type:`).

### 2. Custom renderer / editor templates

Drop `<template>` tags on the page, then point to them by id from the column.

```ruby
column :sport,
  type: :enum,
  editable: true,
  enum_values: %w[running cycling swimming],
  cell_renderer: "sgr-sport",
  cell_editor:   "sgr-sport-editor"
```

```erb
<template id="sgr-sport">
  <span class="pill" data-bind="sport" data-bind-attr="data-sport"></span>
</template>

<template id="sgr-sport-editor">
  <select data-editor-input>
    <% AthleteGrid.columns_registry[:sport].enum_values.each do |s| %>
      <option><%= s %></option>
    <% end %>
  </select>
</template>
```

Renderer bindings the gem honours when cloning the template:

- `data-bind="field"` → element text = `row.field`
- `data-bind-text` → formatted value
- `data-bind-attr="name"` → sets attribute `name` to the cell value

Editor: the control marked `[data-editor-input]` (or the first
`input/select/textarea`) is seeded, focused on mount, and read on commit.
A column may declare both `cell_renderer:` and `cell_editor:`.

### 3. Full custom Stimulus editor

Register your own controller in the host app and use it like any other
Stimulus controller inside the `cell_editor` template — `stimulus_grid_rails.js`
doesn't hard-code the input type, it just clones the template and reads
`[data-editor-input]` on commit. So a custom autocomplete / combobox / date
range editor is "write a Stimulus controller, put its `data-controller` on the
template root".

## Can a Rails model have multiple grids?

**Yes.** Grids are registered by `resource` (the URL segment + registry key),
not by model. Each subclass calls
`StimulusGridRails.register_grid(@resource_name, self)`, so as long as the
resource names differ they coexist:

```ruby
class AthleteGrid < StimulusGridRails::Grid
  resource :athletes
  model    Athlete
  column :name, type: :string, editable: true
  column :age,  type: :integer, editable: true
end

class AthleteAdminGrid < StimulusGridRails::Grid
  resource :admin_athletes
  model    Athlete

  # show soft-deleted too
  def scope(user = self.user) = Athlete.unscoped

  column :name,         type: :string,  editable: ->(_r, u) { u.admin? }
  column :lock_version, type: :integer, editable: false
  column :notes,        type: :text,    editable: true
end
```

Each grid has its own column set, permissions, `scope`, computed columns, and
endpoints under its resource segment:

- `PATCH /grids/athletes/:row_id/cells/:column`
- `PATCH /grids/admin_athletes/:row_id/cells/:column`

### Broadcastable caveat

`broadcasts_grid AthleteGrid` wires the model to **one** grid class for
auto-broadcasts (the model holds a single `stimulus_grid_class`). If you want
multiple grids on the same model to receive live updates, either:

- pick one "canonical" grid for auto-broadcasts and let the others rely on
  page refresh / manual `TurboStreams.cell(...)` broadcasts, or
- skip `broadcasts_grid` and emit your own broadcasts in
  `after_*_commit` callbacks, fanning out to each grid's streamables via
  `StimulusGridRails.streamables_for(:athletes)` and
  `StimulusGridRails.streamables_for(:admin_athletes)`.
