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
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        toolbar_size: Literal[
            "extra-small", "small", "medium", "large"
        ] = "small",
        canvas_min_height: str = "500px",
        enable_virtualization: bool = False,
        enable_grid_snap: bool = False,
        grid_size: int = 20,
        layout_engine: Literal["dagre", "elkjs"] = "dagre",
        toolbar_visibility: dict[str, bool] | None = None,
        node_size_scale: float = 1.0,
        node_font_size: int = 14,
        edge_width: float = 2.0,
        edge_label_font_size: int = 12,
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
            toolbar_size: The size of the toolbar. Can be "extra-small", "small", "medium", or "large".
                Defaults to "small".
            canvas_min_height: min pixel height of the svelteflow canvas. Defaults to "500px".
            enable_virtualization: If True, only nodes inside the viewport will be rendered. Improves performance
                for large graphs. Defaults to False.
            enable_grid_snap: If True, nodes will snap to the grid when dragged. Defaults to False.
            grid_size: The size of the grid in pixels. Only used if enable_grid_snap is True. Defaults to 20.
            layout_engine: The layout engine to use for auto-layout. Can be "dagre" or "elkjs". Defaults to "dagre".
            toolbar_visibility: A dictionary to control the visibility of specific toolbar items. Keys are item names,
                values are booleans. Defaults to None (all visible).
            node_size_scale: A scaling factor for the size of nodes. Defaults to 1.0.
            node_font_size: The font size of the text inside nodes. Defaults to 14.
            edge_width: The width of the edges in pixels. Defaults to 2.0.
            edge_label_font_size: The font size of the text on edges. Defaults to 12.
        """
        self.toolbar_size = toolbar_size
        self.canvas_min_height = canvas_min_height
        self.enable_virtualization = enable_virtualization
        self.enable_grid_snap = enable_grid_snap
        self.grid_size = grid_size
        self.layout_engine = layout_engine
        self.toolbar_visibility = toolbar_visibility
        self.node_size_scale = node_size_scale
        self.node_font_size = node_font_size
        self.edge_width = edge_width
        self.edge_label_font_size = edge_label_font_size
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
                                    "name": {"type": "string"},
                                    "description": {"type": "string"},
                                    "attributes": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "key": {"type": "string"},
                                                "value": {"type": "string"},
                                                "visible": {"type": "boolean"},
                                                "connectable": {
                                                    "type": "boolean"
                                                },
                                                "type": {"type": "string"},
                                            },
                                        },
                                    },
                                    "handles": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "id": {"type": "string"},
                                                "type": {"type": "string"},
                                            },
                                        },
                                    },
                                    "collapsed": {"type": "boolean"},
                                },
                            },
                            "position": {
                                "type": "object",
                                "properties": {
                                    "x": {"type": "number"},
                                    "y": {"type": "number"},
                                },
                            },
                            "measured": {
                                "type": "object",
                                "properties": {
                                    "width": {"type": "number"},
                                    "height": {"type": "number"},
                                },
                            },
                            "selected": {"type": "boolean"},
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
                            "label": {"type": "string"},
                            "type": {"type": "string"},
                            "markerEnd": {"type": "string"},
                        },
                    },
                },
                "loaded": {"type": "boolean"},
                "zoomToNodeName": {"type": "string", "nullable": True},
            },
        }

    def example_payload(self) -> Any:
        return {}

    def example_value(self) -> Any:
        return {
            "nodes": [
                {
                    "id": "adae56af-9bb7-4f67-a62d-dd173949a051",
                    "position": {"x": 563, "y": 126},
                    "data": {
                        "name": "Node-adae",
                        "description": "This is a node",
                        "attributes": [
                            {
                                "key": "fruit",
                                "value": "apple",
                                "visible": True,
                                "connectable": True,
                                "type": "input",
                            }
                        ],
                        "handles": [{"id": "fruit", "type": "input"}],
                        "collapsed": False,
                    },
                    "type": "custom",
                    "measured": {"width": 182, "height": 80},
                    "selected": False,
                },
                {
                    "id": "36a5e9b8-2b7d-4c08-b34f-1da5d4fb7602",
                    "position": {"x": 282, "y": 149.5},
                    "data": {
                        "name": "Node-36a5",
                        "description": "This is a node",
                        "attributes": [
                            {
                                "key": "fruit",
                                "value": "apple",
                                "visible": True,
                                "connectable": True,
                                "type": "output",
                            }
                        ],
                        "handles": [{"id": "fruit", "type": "output"}],
                        "collapsed": False,
                    },
                    "type": "custom",
                    "measured": {"width": 182, "height": 80},
                    "selected": False,
                },
            ],
            "edges": [
                {
                    "id": "36a5e9b8-2b7d-4c08-b34f-1da5d4fb7602_adae56af-9bb7-4f67-a62d-dd173949a051_1",
                    "source": "36a5e9b8-2b7d-4c08-b34f-1da5d4fb7602",
                    "target": "adae56af-9bb7-4f67-a62d-dd173949a051",
                    "sourceHandle": "fruit",
                    "targetHandle": "fruit",
                    "label": "apple",
                    "type": "custom",
                }
            ],
            "loaded": False,
            "zoomToNodeName": None,
        }
