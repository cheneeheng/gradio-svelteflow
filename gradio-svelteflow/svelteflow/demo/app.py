import gradio as gr
from gradio_svelteflow import Svelteflow


example = Svelteflow().example_value()

demo = gr.Interface(
    lambda x: x,
    Svelteflow(),  # interactive version of your component
    Svelteflow(),  # static version of your component
    # examples=[[example]],  # uncomment this line to view the "example version" of your component
)


if __name__ == "__main__":
    demo.launch()
