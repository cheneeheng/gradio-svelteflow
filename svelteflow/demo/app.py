import gradio as gr
from gradio_svelteflow import SvelteFlow


example = SvelteFlow().example_value()

with gr.Blocks() as demo:
    btn = gr.Button("Example")
    btn_zoomin = gr.Button("Zoom In")
    sf1 = SvelteFlow(
        info="Standard block usage",
        label="SvelteFlow1",
        show_label=True,
        interactive=True,
        visible=True,
        toolbar_size="small",
        canvas_min_height="500px",
    )
    with gr.Accordion("flow"):
        sf2 = SvelteFlow(
            info="usage inside an accordion",
            label="SvelteFlow2",
            show_label=True,
            interactive=True,
            visible=True,
            toolbar_size="small",
            canvas_min_height="500px",
        )
    json = gr.JSON()
    txt = gr.Textbox(value="0")

    btn.click(lambda: example, None, sf1)
    btn.click(lambda: example, None, sf2)

    def set_zoomToNodeName(value_):
        value_["zoomToNodeName"] = "Node-adae"
        return value_

    btn_zoomin.click(set_zoomToNodeName, sf1, sf1)
    btn_zoomin.click(set_zoomToNodeName, sf2, sf2)

    sf1.change(lambda x: str(int(x) + 1), txt, txt)
    sf2.change(lambda x: str(int(x) + 1), txt, txt)

    sf1.change(lambda x: x, sf1, json)
    sf2.change(lambda x: x, sf2, json)


if __name__ == "__main__":
    demo.launch()
