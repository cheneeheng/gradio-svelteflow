import gradio as gr
from gradio_svelteflow import SvelteFlow


example = SvelteFlow().example_value()

with gr.Blocks() as app:
    btn = gr.Button()
    sf = SvelteFlow()
    btn.click(lambda: example, None, sf)

app.launch()

# demo = gr.Interface(
#     lambda x: x,
#     SvelteFlow(),  # interactive version of your component
#     SvelteFlow(),  # static version of your component
#     # examples=[[example]],  # uncomment this line to view the "example version" of your component
# )


# if __name__ == "__main__":
#     demo.launch()
