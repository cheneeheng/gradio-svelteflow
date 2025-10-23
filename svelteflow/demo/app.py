import gradio as gr
from gradio_svelteflow import SvelteFlow


example = SvelteFlow().example_value()

with gr.Blocks() as app:
    json = gr.JSON()
    btn = gr.Button("Example")
    sf = SvelteFlow(
        # info="INFO",
        # label="LABEL",
        # show_label=True,
    )
    btn.click(
        lambda: example,
        None,
        sf,
    )
    # sf.change(
    #     lambda x: x,
    #     sf,
    #     json,
    # )


app.launch()

# demo = gr.Interface(
#     lambda x: x,
#     SvelteFlow(),  # interactive version of your component
#     SvelteFlow(),  # static version of your component
#     # examples=[[example]],  # uncomment this line to view the "example version" of your component
# )


# if __name__ == "__main__":
#     demo.launch()
