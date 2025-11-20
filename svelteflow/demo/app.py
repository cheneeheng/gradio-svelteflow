import gradio as gr
from gradio_svelteflow import SvelteFlow


example = SvelteFlow().example_value()

with gr.Blocks() as demo:
    btn = gr.Button("Example")
    sf = SvelteFlow(
        info="INFO",
        label="LABEL",
        show_label=True,
        interactive=True,
        submit_btn=True,
        visible=True,
        canvas_min_height="800px",
    )
    with gr.Accordion("flow"):
        sf = SvelteFlow(
            # info="INFO",
            # label="LABEL",
            show_label=False,
            interactive=True,
            submit_btn=True,
            visible=True,
            canvas_min_height="800px",
        )
    json = gr.JSON()
    txt = gr.Textbox(value="0")

    btn.click(lambda: example, None, sf)
    sf.change(
        lambda x: str(int(x) + 1),
        txt,
        txt,
    )

    def tmp(x_):
        print(x_)
        return x_

    sf.change(tmp, sf, json)


if __name__ == "__main__":
    demo.launch()
