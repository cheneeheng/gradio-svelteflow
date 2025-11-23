# gradio-svelteflow

Gradio component for svelteflow

**IMPORTANT:**

- Gradio uses svelte4
- @xyflow/svelte@0.x.x supports svelte4
- @xyflow/svelte@1.x.x uses svelte5

## [svelteflow](svelteflow)

- Svelteflow wrapper in Gradio built as gradio custom component.
- Frontend:
  - Main svelte component: [GraphUI.svelte](svelteflow/frontend/graph/GraphUI.svelte)
  - This is a clone of the same component in [svelteflow-app](svelteflow-app) but with the event dispatcher and value props for gradio.
- Backend:
  - Component defintion in Python: [svelteflow.py](svelteflow/backend/gradio_svelteflow/svelteflow.py)

## [svelteflow-app](svelteflow-app)

- Svelteflow wrapper in svelte4 built using vite.
- Frontend:
  - Main svelte component: [GraphUI.svelte](svelteflow-app/src/graph/GraphUI.svelte)
  - This is a clone of the same component in [svelteflow](svelteflow) but without the event dispatcher and value props for gradio.

## Acknowledgement

- Besides the bootstrapped code from gradio custom component cli and vite cli, the code in this repo is written with the help of Gemini CLI and Copilot.
