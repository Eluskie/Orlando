# Phase 4: Canvas Workspace - Research

**Researched:** 2026-02-08
**Domain:** Canvas rendering, spatial workspace, infinite canvas interactions
**Confidence:** HIGH

## Summary

This phase implements a spatial canvas workspace for viewing and organizing brand assets using Konva.js with react-konva. The project already has the necessary libraries installed (`konva@10.2.0`, `react-konva@19.2.2`, `zundo@2.3.0`, `zustand@5.0.11`) and a scaffolded canvas store with undo/redo support.

The research confirms that react-konva is the standard React binding for Konva, providing declarative canvas components with full event support. Key implementation patterns include: Stage-based zoom/pan using wheel events and stage.position(), Transformer components for selection/resize/rotate, and state-driven rendering where object state flows through Zustand rather than Konva serialization.

The existing `canvas-store.ts` already implements the correct pattern for undo/redo using zundo's temporal middleware, tracking only objects (not viewport/selection) as decided in Phase 1. The main work is building UI components that consume and manipulate this store.

**Primary recommendation:** Build canvas components as thin react-konva wrappers around the existing Zustand store, using refs for imperative Konva operations (zoom, Transformer) while keeping object data in reactive state.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| konva | 10.2.0 | Canvas rendering engine | Battle-tested 2D canvas library, 10k+ GitHub stars, official React bindings |
| react-konva | 19.2.2 | React bindings for Konva | Official maintained bindings, declarative component API |
| zustand | 5.0.11 | State management | Already used in project, lightweight, perfect for canvas state |
| zundo | 2.3.0 | Undo/redo middleware | Already integrated in canvas-store.ts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| use-image | 1.1.4 | Async image loading hook | Loading images for canvas display |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Konva | Fabric.js | Fabric has more built-in features but heavier, less performant |
| Konva | tldraw | Full solution but opinionated, harder to customize |
| Konva | pixi.js | Better for WebGL/games, overkill for 2D workspace |

**Installation:**
```bash
npm install use-image
```

Note: `konva` and `react-konva` are already installed per package.json.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── canvas/
│       ├── canvas-workspace.tsx     # Main Stage container
│       ├── canvas-image.tsx         # Image rendering with useImage
│       ├── canvas-transformer.tsx   # Selection handles wrapper
│       ├── canvas-toolbar.tsx       # Action toolbar (zoom, undo, etc)
│       └── index.ts                 # Barrel export
├── stores/
│   └── canvas-store.ts              # Already exists - Zustand + zundo
└── hooks/
    └── use-canvas-interactions.ts   # Zoom/pan/selection logic
```

### Pattern 1: State-Driven Rendering
**What:** Keep object data in Zustand, render declaratively with react-konva
**When to use:** Always - this is the core architecture
**Example:**
```typescript
// Source: Konva best practices + existing canvas-store pattern
function CanvasWorkspace({ brandId }: { brandId: string }) {
  const objects = useCanvasStore((s) => s.objects);
  const selectedIds = useCanvasStore((s) => s.selectedIds);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        {objects.map((obj) => (
          <CanvasObject key={obj.id} object={obj} isSelected={selectedIds.includes(obj.id)} />
        ))}
        {selectedIds.length > 0 && <CanvasTransformer selectedIds={selectedIds} />}
      </Layer>
    </Stage>
  );
}
```

### Pattern 2: Imperative Operations via Refs
**What:** Use refs for Konva-specific operations (zoom calculations, transformer attachment)
**When to use:** Zoom/pan, Transformer attachment, hit detection
**Example:**
```typescript
// Source: https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html
const stageRef = useRef<Konva.Stage>(null);

const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
  e.evt.preventDefault();
  const stage = stageRef.current;
  if (!stage) return;

  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition()!;
  const scaleBy = 1.05;
  const direction = e.evt.deltaY > 0 ? -1 : 1;
  const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };

  stage.scale({ x: newScale, y: newScale });
  stage.position(newPos);

  // Sync to Zustand for persistence
  setZoom(newScale);
  setPan(newPos.x, newPos.y);
};
```

### Pattern 3: Transformer Selection Pattern
**What:** Attach Transformer to selected shapes via useEffect
**When to use:** When implementing selection/resize/rotate
**Example:**
```typescript
// Source: https://konvajs.org/docs/react/Transformer.html
function CanvasTransformer({ selectedIds }: { selectedIds: string[] }) {
  const transformerRef = useRef<Konva.Transformer>(null);
  const layerRef = useContext(LayerContext);

  useEffect(() => {
    if (!transformerRef.current || !layerRef) return;

    const nodes = selectedIds
      .map(id => layerRef.findOne(`#${id}`))
      .filter(Boolean) as Konva.Node[];

    transformerRef.current.nodes(nodes);
  }, [selectedIds, layerRef]);

  return <Transformer ref={transformerRef} />;
}
```

### Pattern 4: Image Loading with useImage
**What:** Use the use-image hook for async image loading
**When to use:** Always when rendering images on canvas
**Example:**
```typescript
// Source: https://github.com/konvajs/use-image
import useImage from 'use-image';

function CanvasImage({ src, ...props }: { src: string } & Konva.ImageConfig) {
  const [image, status] = useImage(src, 'anonymous');

  if (status === 'loading') {
    // Could render placeholder
    return null;
  }

  if (status === 'failed') {
    // Could render error state
    return null;
  }

  return <Image image={image} {...props} />;
}
```

### Anti-Patterns to Avoid
- **Direct Konva mutations without state sync:** Always update Zustand state, let react-konva re-render. Never `shape.x(100)` without `updateObject(id, { x: 100 })`.
- **Using toJSON() for state persistence:** Konva's serialization is complex and fragile. Store minimal state in Zustand.
- **Creating too many layers:** Keep to 1-3 layers max. Use Groups for organization.
- **Caching simple shapes:** Only cache complex shapes with filters. Simple rectangles render faster without caching.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image loading | Custom fetch + onload | `use-image` hook | Handles loading states, CORS, cleanup automatically |
| Undo/redo | History array manually | `zundo` middleware | Already integrated, handles edge cases |
| Selection handles | Custom anchor shapes | `Konva.Transformer` | Full-featured resize/rotate with edge detection |
| Zoom to pointer | Calculate manually | Konva's documented pattern | Math is tricky, standard pattern exists |
| Touch pinch zoom | Custom touch handlers | Konva's multi-touch pattern | Distance/center calculations are error-prone |

**Key insight:** Konva has battle-tested patterns for every standard canvas interaction. The official docs provide working code for zoom, pan, selection, transform, and touch gestures. Use them.

## Common Pitfalls

### Pitfall 1: Transformer Modifies Scale, Not Dimensions
**What goes wrong:** After resize, object has `width: 100, scaleX: 2` instead of `width: 200, scaleX: 1`
**Why it happens:** Transformer changes scaleX/scaleY, not width/height
**How to avoid:** In `onTransformEnd`, calculate actual dimensions and reset scale:
```typescript
onTransformEnd={(e) => {
  const node = e.target;
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();

  node.scaleX(1);
  node.scaleY(1);

  updateObject(id, {
    x: node.x(),
    y: node.y(),
    width: Math.max(5, node.width() * scaleX),
    height: Math.max(5, node.height() * scaleY),
    rotation: node.rotation(),
  });
}}
```
**Warning signs:** Objects get progressively smaller/larger on repeated transforms

### Pitfall 2: Touch Events Blocked During Drag
**What goes wrong:** Pinch zoom doesn't work while dragging
**Why it happens:** Konva blocks events during drag for performance
**How to avoid:** Set `Konva.hitOnDragEnabled = true` at app initialization
**Warning signs:** Single-finger drag works, two-finger pinch doesn't

### Pitfall 3: Layer Re-renders on Every Change
**What goes wrong:** Entire canvas re-renders when one object moves
**Why it happens:** Layer redraws all children on any prop change
**How to avoid:**
- Use `shouldComponentUpdate` or `React.memo` for shape components
- Split interactive objects into separate layer during drag
- Batch updates where possible
**Warning signs:** Janky performance with 50+ objects

### Pitfall 4: Stage Coordinates vs. Pointer Coordinates
**What goes wrong:** Objects placed at wrong positions, clicks don't hit right objects
**Why it happens:** Confusing screen coordinates with stage coordinates after zoom/pan
**How to avoid:** Always use `stage.getPointerPosition()` then transform:
```typescript
const pointer = stage.getPointerPosition();
const transform = stage.getAbsoluteTransform().copy().invert();
const pos = transform.point(pointer);
// pos is now in stage coordinates
```
**Warning signs:** Position bugs only appear when zoomed in/out

### Pitfall 5: Undo/Redo Tracks Too Much State
**What goes wrong:** Undo changes zoom level or selection, confusing users
**Why it happens:** Not filtering what goes into history
**How to avoid:** Already implemented correctly in canvas-store.ts using `partialize`:
```typescript
partialize: (state) => {
  const { objects } = state;
  return { objects } as CanvasState;
}
```
**Warning signs:** Users lose their view position after undo

## Code Examples

Verified patterns from official sources:

### Wheel Zoom with Pointer Anchoring
```typescript
// Source: https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html
const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
  e.evt.preventDefault();
  const stage = stageRef.current;
  if (!stage) return;

  const scaleBy = 1.05;
  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition()!;

  // Calculate new scale
  const direction = e.evt.ctrlKey
    ? -e.evt.deltaY > 0 ? 1 : -1  // Trackpad pinch
    : e.evt.deltaY > 0 ? -1 : 1;   // Mouse wheel

  const newScale = Math.max(0.1, Math.min(5,
    direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
  ));

  // Zoom toward pointer
  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };

  stage.scale({ x: newScale, y: newScale });
  stage.position(newPos);
  stage.batchDraw();

  // Persist to store
  setZoom(newScale);
  setPan(newPos.x, newPos.y);
}, [setZoom, setPan]);
```

### Stage with Pan (Draggable)
```typescript
// Source: https://konvajs.org/docs/react/index.html
<Stage
  ref={stageRef}
  width={containerWidth}
  height={containerHeight}
  draggable
  onDragEnd={(e) => {
    const stage = e.target as Konva.Stage;
    setPan(stage.x(), stage.y());
  }}
  onWheel={handleWheel}
  onMouseDown={handleDeselect}
>
  <Layer>
    {/* Objects render here */}
  </Layer>
</Stage>
```

### Selection with Click Detection
```typescript
// Source: https://konvajs.org/docs/react/Transformer.html
const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
  // Clicked on empty area
  if (e.target === e.target.getStage()) {
    setSelection([]);
    return;
  }

  // Clicked on a shape
  const clickedId = e.target.id();
  if (!clickedId) return;

  // Shift-click for multi-select
  if (e.evt.shiftKey) {
    setSelection((prev) =>
      prev.includes(clickedId)
        ? prev.filter(id => id !== clickedId)
        : [...prev, clickedId]
    );
  } else {
    setSelection([clickedId]);
  }
};
```

### Draggable Object with State Sync
```typescript
// Source: Best practices composite pattern
function DraggableImage({ object }: { object: CanvasObject }) {
  const updateObject = useCanvasStore((s) => s.updateObject);
  const [image] = useImage(object.src!, 'anonymous');

  return (
    <Image
      id={object.id}
      image={image}
      x={object.x}
      y={object.y}
      width={object.width}
      height={object.height}
      rotation={object.rotation}
      scaleX={object.scaleX}
      scaleY={object.scaleY}
      draggable={!object.locked}
      onDragEnd={(e) => {
        updateObject(object.id, {
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    />
  );
}
```

### Toolbar Component Pattern
```typescript
// Source: Common UI pattern
function CanvasToolbar() {
  const { zoom, resetView } = useCanvasStore();
  const { undo, redo, pastStates, futureStates } = useCanvasStore.temporal.getState();

  return (
    <div className="absolute top-4 left-4 flex gap-2 bg-white rounded-lg shadow-md p-2">
      <button onClick={() => undo()} disabled={pastStates.length === 0}>
        <Undo2 className="w-5 h-5" />
      </button>
      <button onClick={() => redo()} disabled={futureStates.length === 0}>
        <Redo2 className="w-5 h-5" />
      </button>
      <div className="w-px bg-gray-200" />
      <button onClick={() => setZoom(zoom * 1.2)}>
        <ZoomIn className="w-5 h-5" />
      </button>
      <button onClick={() => setZoom(zoom / 1.2)}>
        <ZoomOut className="w-5 h-5" />
      </button>
      <button onClick={resetView}>
        <Maximize2 className="w-5 h-5" />
      </button>
      <span className="text-sm text-gray-500 px-2">
        {Math.round(zoom * 100)}%
      </span>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fabric.js for React | react-konva | 2020+ | Better React integration, declarative API |
| JSON serialization for undo | State history tracking | Always | Simpler, more reliable |
| Manual touch gesture math | Konva built-in patterns | Konva 8+ | Less code, fewer bugs |
| Global event listeners | React event props | react-konva adoption | Cleaner component isolation |

**Deprecated/outdated:**
- `Konva.FastLayer`: Still exists but rarely needed with modern browsers
- Manual hit detection: Use Konva's built-in event system instead
- Canvas2D direct manipulation: Use Konva's scene graph abstraction

## Open Questions

Things that couldn't be fully resolved:

1. **Workspace persistence per brand**
   - What we know: Database has `canvas_x`, `canvas_y`, `canvas_scale` fields on assets table
   - What's unclear: Should viewport (zoom/pan) also persist per brand?
   - Recommendation: Store viewport in Zustand for session, persist only object positions to DB. Add viewport persistence in Phase 6 if needed.

2. **Large asset count performance**
   - What we know: Konva handles 1000+ shapes, but re-renders can be slow
   - What's unclear: Exact threshold for this project's asset complexity
   - Recommendation: Start simple, add layer optimization (moving objects during drag) if >50 objects cause jank

3. **Mobile touch support scope**
   - What we know: Konva supports multi-touch zoom/pan
   - What's unclear: Phase 4 requirements don't mention mobile explicitly
   - Recommendation: Implement basic pinch zoom with `Konva.hitOnDragEnabled = true`, full mobile optimization deferred

## Sources

### Primary (HIGH confidence)
- Konva official documentation - https://konvajs.org/docs/react/index.html (setup, concepts)
- Konva zoom tutorial - https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html (zoom implementation)
- Konva Transformer docs - https://konvajs.org/docs/react/Transformer.html (selection/resize)
- Konva undo/redo docs - https://konvajs.org/docs/react/Undo-Redo.html (history pattern)
- Konva performance tips - https://konvajs.org/docs/performance/All_Performance_Tips.html (optimization)
- Konva multi-touch - https://konvajs.org/docs/sandbox/Multi-touch_Scale_Stage.html (pinch zoom)
- use-image GitHub - https://github.com/konvajs/use-image (image loading hook)
- Existing canvas-store.ts - Project codebase (zundo integration)

### Secondary (MEDIUM confidence)
- Konva best practices - https://konvajs.org/docs/data_and_serialization/Best_Practices.html (state management philosophy)
- Zustand discussions - https://github.com/pmndrs/zustand/discussions/2496 (multiple stores pattern)

### Tertiary (LOW confidence)
- Various Medium/blog posts on react-konva patterns (used for cross-reference only)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries already installed, official docs verified
- Architecture: HIGH - Patterns from official Konva docs, existing store validates approach
- Pitfalls: HIGH - Well-documented in Konva docs and community

**Research date:** 2026-02-08
**Valid until:** 60 days (Konva/react-konva are stable, infrequent breaking changes)
