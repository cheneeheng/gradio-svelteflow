import gradio as gr
from gradio_svelteflow import SvelteFlow


example = SvelteFlow().example_value()

with gr.Blocks() as demo:
    btn = gr.Button("Example")
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
    sf1.change(lambda x: str(int(x) + 1), txt, txt)
    sf2.change(lambda x: str(int(x) + 1), txt, txt)
    sf1.change(lambda x: x, sf1, json)
    sf2.change(lambda x: x, sf2, json)


if __name__ == "__main__":
    demo.launch()
