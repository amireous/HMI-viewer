# Industrial Drawing (HMI) Viewer

An Angular standalone application for inspecting an industrial plant drawing, searching for devices, editing SVG element properties, and previewing live device status on the HMI canvas.

## Features

- **Interactive SVG viewer:** Loads `public/plant.svg` as inline SVG content. Left-click an SVG element to highlight it and open a floating properties modal.
- **Properties editing:** Inspect and edit the selected element's SVG attributes, then save the changes directly to the injected SVG DOM.
- **Canvas annotations:** Right-click the drawing to place a text label at the exact cursor position. Labels can be removed using their delete control.
- **Device search:** Search devices by name or code with a debounced reactive form. Selecting a result highlights the matching device in the SVG and stores it in the recent-selection list.
- **Recent selections:** Keeps the five most recently selected devices, moves repeated selections to the front, and removes duplicates by device ID.
- **Preview Mode:** Polls the local device endpoint every five seconds and updates SVG device colors from the latest status values. Editing and annotation interactions are disabled while preview mode is active.

## Application Flow

1. `SvgWorkspace` requests `/plant.svg` through `HttpClient`, sanitizes the controlled SVG asset, and renders it with `[innerHTML]`.
2. A left-click is captured by `@HostListener('click')`. The workspace finds the nearest SVG shape, clears the previous highlight, reads its attributes, and sends the modal position and selected element to `SvgStateService`.
3. `FloatingModal` reads the service signal, displays the selected attributes, and uses `Renderer2` to write edited values back when the user saves.
4. A right-click is captured by `@HostListener('contextmenu')`. The cursor is transformed from screen coordinates into SVG coordinates before a label group is created and appended to the SVG.
5. `DeviceSearch` debounces and normalizes input, calls `ApiService.searchDevices()`, and renders the returned devices. Selecting a device delegates to `SvgStateService`, clears the search UI, and updates the shared selected ID.
6. `SvgWorkspace` reacts to the selected ID and finds the corresponding `[data-device-id]` element, highlights it, and scrolls it into view. In Preview Mode, the same workspace starts a five-second polling stream and applies each device status as a `data-status` attribute.

## Architecture and State Management

- The application uses Angular standalone components: `App`, `DeviceSearch`, `SvgWorkspace`, and `FloatingModal` are composed directly through component imports.
- `SvgStateService` is a root-provided shared state boundary. Angular Signals expose `selectedDeviceId`, `recentSelections`, `previewMode`, and `modalState` to isolated components without passing state through multiple template levels.
- `ApiService` owns device retrieval, normalization, status mapping, filtering, and API error fallback. Components consume its `Observable<Device[]>` contract rather than handling raw JSON.
- `ChangeDetectionStrategy.OnPush` is used by the application and feature components, with Signals and RxJS streams providing explicit reactive updates.

## SVG DOM and Coordinate Handling

- The plant drawing is injected SVG content rather than Angular template markup. `Renderer2` is therefore used for adding and removing classes, setting attributes, creating SVG nodes, and appending label groups.
- `@HostListener` provides the event boundary for interactions with the injected SVG while keeping click and context-menu behavior inside `SvgWorkspace`.
- Right-click placement uses `createSVGPoint()` to represent the browser cursor and `getScreenCTM().inverse()` to convert screen coordinates into the SVG's local coordinate system. Labels remain correctly positioned when the drawing is scaled, resized, or transformed.
- Selection and preview lookup are limited to the current SVG root. Missing roots, missing target elements, unavailable transformation matrices, and cancelled labels exit without mutating the canvas.

## Preview Mode and CSS Rendering

Preview Mode follows a separation-of-concerns approach:

- RxJS `interval(5000)` with `startWith(0)` performs an immediate fetch and then polls `/devices.json` every five seconds.
- The component does not inject presentation styles from JavaScript. It sets `data-status="running|stopped|fault|unknown"` on matching SVG elements.
- CSS selectors apply the stroke and text colors for each status, leaving visual policy in stylesheets and keeping the TypeScript focused on state and DOM structure.
- Entering Preview Mode closes the modal. Leaving it unsubscribes from polling and removes temporary `data-status` attributes.
- The polling subscription is cleaned up with `takeUntilDestroyed`, and failed API requests resolve to an empty device list rather than crashing the viewer.

## Data Normalization and Robustness

- Raw device records may contain null, blank, duplicated, or inconsistently cased values. `ApiService` trims and lowercases identifiers and codes before using them.
- A `Map<string, Device>` keyed by normalized ID, with code as a fallback, collapses duplicate records. Records without either usable identifier are skipped.
- Display fields use strict fallbacks such as `Unknown Device`, `Unknown Type`, `Unknown Area`, `Unknown Vendor`, and `unknown code`.
- Status values are whitelist-mapped to `running`, `stopped`, or `fault`; null, blank, and unknown statuses become `unknown`.
- Device matching is case-insensitive. The current implementation lowercases both the SVG `data-device-id` value and the selected device ID before comparing them. Where selector-based matching is used, the equivalent CSS attribute selector is `[data-device-id="..." i]`.
- Search input is trimmed, debounced by 300 ms, and ignored below two characters. `switchMap` ensures a newer query replaces an older in-flight request, while `takeUntilDestroyed` prevents subscriptions from outliving the component.
- Long and bidirectional strings are rendered defensively with CSS `overflow: hidden`, `text-overflow: ellipsis`, and `white-space: nowrap`, plus `dir="auto"` on the search surface and result content.

## Project Structure

```text
src/app/
	core/
		models/              Shared device types
		services/            API and signal-based application state
	features/
		device-search/       Reactive search and recent selections
		floating-modal/      SVG attribute editor
		svg-workspace/       SVG loading, interaction, labels, and preview polling
public/
	devices.json           Local device data endpoint
	plant.svg              Industrial drawing asset
```

## How to Run

### Prerequisites

- Node.js and npm

### Install and start

```bash
npm install
npm start
```

Open `http://localhost:4200/` after the development server starts. Angular serves the files in `public/` as static assets, so `/devices.json` and `/plant.svg` are available to the application without a separate backend.

### Build

```bash
npm run build
```

### Unit tests

```bash
npm test
```

## AI Disclosure

GitHub Copilot and other LLM-assisted tooling were used to generate initial boilerplate, assist with RxJS pipelines, and support the SVG coordinate and matrix-math implementation. All generated code was heavily reviewed, tested, and adapted to the application's architecture, data model, interaction requirements, and safety constraints.
