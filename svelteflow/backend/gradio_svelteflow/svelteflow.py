from __future__ import annotations

from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any, Literal

from gradio.components.base import Component
from gradio.events import Events
from gradio.i18n import I18nData


if TYPE_CHECKING:
    from gradio.components import Timer


class SvelteFlow(Component):
    """
    Creates a SvelteFlow component to display and edit flow diagrams.
    """

    EVENTS = [
        Events.change,
        Events.input,
        Events.submit,
        Events.select,
    ]

    def __init__(
        self,
        value: dict | Callable | None = None,
        *,
        label: str | I18nData | None = None,
        info: str | I18nData | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        submit_btn: bool = False,
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
    ):
        """
        Parameters:
            value: default text to provide in textbox. If a function is provided, the function will be called each
                time the app loads to set the initial value of this component.
            placeholder: placeholder hint to provide behind textbox.
            label: the label for this component, displayed above the component if `show_label` is `True` and is also
                used as the header if there are a table of examples for this component.
                If None and used in a `gr.Interface`, the label will be the name of the parameter this component
                corresponds to.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise).
                Can provide a Timer whose tick resets `value`, or a float that provides the regular interval
                for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function
                (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row,
                and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer.
                    scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value.
                If a certain scale value results in this Component being narrower than min_width,
                the min_width parameter will be respected first.
            interactive: if True, will be rendered as an editable textbox; if False, editing will be disabled.
                If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden. If "hidden", component will be visually hidden and
                not take up space in the layout but still exist in the DOM
            rtl: If True and `type` is "text", sets the direction of the text to right-to-left
                (cursor appears on the left of the text). Default is False, which renders cursor on the right.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM.
                Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component
                in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used
                if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component,
                not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function,
                if a component is re-rendered with the same key, these (and only these) parameters will be preserved
                in the UI (if they have been changed by the user or an event listener) instead of re-rendered
                based on the values provided during constructor.
        """
        self.submit_btn = submit_btn
        super().__init__(
            label=label,
            info=info,
            every=every,
            inputs=inputs,
            show_label=show_label,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            render=render,
            key=key,
        )

    def preprocess(self, payload: dict | None) -> dict | None:
        """
        Parameters:
            payload: the data from the frontend.
        Returns:
            Passes the data as a {dict} into the function.
        """
        return payload

    def postprocess(self, value: dict | None) -> dict | None:
        """
        Parameters:
            value: Expects a {dict} returned from function and sets the value of the component to it.
        Returns:
            The value to display in the frontend.
        """
        return value

    def api_info(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "nodes": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string"},
                            "type": {"type": "string"},
                            "data": {
                                "type": "object",
                                "properties": {
                                    "label": {"type": "string"},
                                    "sources": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "id": {"type": "string"},
                                            },
                                        },
                                    },
                                    "targets": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "id": {"type": "string"},
                                            },
                                        },
                                    },
                                    "topOffsetPx": {"type": "number"},
                                    "sideOffsetPx": {"type": "number"},
                                },
                            },
                            "position": {
                                "type": "object",
                                "properties": {
                                    "x": {"type": "number"},
                                    "y": {"type": "number"},
                                },
                            },
                        },
                    },
                },
                "edges": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string"},
                            "source": {"type": "string"},
                            "target": {"type": "string"},
                            "sourceHandle": {"type": "string"},
                            "targetHandle": {"type": "string"},
                            "markerEnd": {"type": "string"},
                        },
                    },
                },
            },
        }

    def example_payload(self) -> Any:
        return {
            "nodes": [
                {
                    "id": "node-1",
                    "type": "dynamic",
                    "position": {"x": 100, "y": 150},
                    "data": {
                        "label": "Start",
                        "sources": [{"id": "node-1-s1"}],
                        "targets": [{"id": "node-1-t1"}],
                        "topOffsetPx": 0,
                        "sideOffsetPx": 8,
                    },
                },
                {
                    "id": "node-2",
                    "type": "dynamic",
                    "position": {"x": 250, "y": 150},
                    "data": {
                        "label": "Process A",
                        "sources": [{"id": "node-2-s1"}],
                        "targets": [{"id": "node-2-t1"}],
                        "topOffsetPx": 0,
                        "sideOffsetPx": 8,
                    },
                },
                {
                    "id": "node-3",
                    "type": "dynamic",
                    "position": {"x": 400, "y": 150},
                    "data": {
                        "label": "Decision",
                        "sources": [{"id": "node-3-s1"}],
                        "targets": [{"id": "node-3-t1"}],
                        "topOffsetPx": 0,
                        "sideOffsetPx": 8,
                    },
                },
                {
                    "id": "node-4",
                    "type": "dynamic",
                    "position": {"x": 550, "y": 100},
                    "data": {
                        "label": "Branch A",
                        "sources": [{"id": "node-4-s1"}],
                        "targets": [{"id": "node-4-t1"}],
                        "topOffsetPx": 0,
                        "sideOffsetPx": 8,
                    },
                },
                {
                    "id": "node-5",
                    "type": "dynamic",
                    "position": {"x": 550, "y": 200},
                    "data": {
                        "label": "Branch B",
                        "sources": [{"id": "node-5-s1"}],
                        "targets": [{"id": "node-5-t1"}],
                        "topOffsetPx": 0,
                        "sideOffsetPx": 8,
                    },
                },
            ],
            "edges": [
                {
                    "id": "node-1:node-1-s1-->node-2:node-2-t1",
                    "source": "node-1",
                    "target": "node-2",
                    "sourceHandle": "node-1-s1",
                    "targetHandle": "node-2-t1",
                    "markerEnd": "arrowclosed",
                },
                {
                    "id": "node-2:node-2-s1-->node-3:node-3-t1",
                    "source": "node-2",
                    "target": "node-3",
                    "sourceHandle": "node-2-s1",
                    "targetHandle": "node-3-t1",
                    "markerEnd": "arrowclosed",
                },
                {
                    "id": "node-3:node-3-s1-->node-4:node-4-t1",
                    "source": "node-3",
                    "target": "node-4",
                    "sourceHandle": "node-3-s1",
                    "targetHandle": "node-4-t1",
                    "markerEnd": "arrowclosed",
                },
                {
                    "id": "node-3:node-3-s1-->node-5:node-5-t1",
                    "source": "node-3",
                    "target": "node-5",
                    "sourceHandle": "node-3-s1",
                    "targetHandle": "node-5-t1",
                    "markerEnd": "arrowclosed",
                },
            ],
        }

    def example_value(self) -> Any:
        return {
            "nodes": [
                {
                    "id": "node-1",
                    # "type": "dynamic",
                    "position": {"x": 100, "y": 150},
                    "data": {
                        "label": "Start",
                        "sources": [{"id": "node-1-s1"}],
                        "targets": [{"id": "node-1-t1"}],
                        "topOffsetPx": 0,
                        "sideOffsetPx": 8,
                    },
                },
                {
                    "id": "node-2",
                    # "type": "dynamic",
                    "position": {"x": 250, "y": 150},
                    "data": {
                        "label": "Process A",
                        "sources": [{"id": "node-2-s1"}],
                        "targets": [{"id": "node-2-t1"}],
                        "topOffsetPx": 0,
                        "sideOffsetPx": 8,
                    },
                },
                {
                    "id": "node-3",
                    # "type": "dynamic",
                    "position": {"x": 400, "y": 150},
                    "data": {
                        "label": "Decision",
                        "sources": [{"id": "node-3-s1"}],
                        "targets": [{"id": "node-3-t1"}],
                        "topOffsetPx": 0,
                        "sideOffsetPx": 8,
                    },
                },
                {
                    "id": "node-4",
                    # "type": "dynamic",
                    "position": {"x": 550, "y": 100},
                    "data": {
                        "label": "Branch A",
                        "sources": [{"id": "node-4-s1"}],
                        "targets": [{"id": "node-4-t1"}],
                        "topOffsetPx": 0,
                        "sideOffsetPx": 8,
                    },
                },
                {
                    "id": "node-5",
                    # "type": "dynamic",
                    "position": {"x": 550, "y": 200},
                    "data": {
                        "label": "Branch B",
                        "sources": [{"id": "node-5-s1"}],
                        "targets": [{"id": "node-5-t1"}],
                        "topOffsetPx": 0,
                        "sideOffsetPx": 8,
                    },
                },
            ],
            "edges": [
                {
                    "id": "node-1:node-1-s1-->node-2:node-2-t1",
                    "source": "node-1",
                    "target": "node-2",
                    "sourceHandle": "node-1-s1",
                    "targetHandle": "node-2-t1",
                    # "markerEnd": "arrowclosed",
                },
                {
                    "id": "node-2:node-2-s1-->node-3:node-3-t1",
                    "source": "node-2",
                    "target": "node-3",
                    "sourceHandle": "node-2-s1",
                    "targetHandle": "node-3-t1",
                    # "markerEnd": "arrowclosed",
                },
                {
                    "id": "node-3:node-3-s1-->node-4:node-4-t1",
                    "source": "node-3",
                    "target": "node-4",
                    "sourceHandle": "node-3-s1",
                    "targetHandle": "node-4-t1",
                    # "markerEnd": "arrowclosed",
                },
                {
                    "id": "node-3:node-3-s1-->node-5:node-5-t1",
                    "source": "node-3",
                    "target": "node-5",
                    "sourceHandle": "node-3-s1",
                    "targetHandle": "node-5-t1",
                    # "markerEnd": "arrowclosed",
                },
            ],
        }
