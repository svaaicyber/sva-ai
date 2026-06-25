from nicegui import ui
import asyncio
from sva_engine import sva_brain


@ui.page('/')
async def main():

    ui.add_head_html("""
    <style>
        body { background:#0d0d0d; color:white; }
        .bubble-user {
            background:#1e1e1e;
            padding:12px;
            border-radius:12px;
            margin-left:auto;
            max-width:70%;
        }
        .bubble-ai {
            background:#141414;
            padding:12px;
            border-radius:12px;
            max-width:80%;
        }
    </style>
    """)

    with ui.column().classes('w-full h-screen justify-between items-center'):

        hero = ui.column().classes('items-center justify-center grow')
        with hero:
            ui.label("SVA").classes("text-4xl")

        chat_scroll = ui.scroll_area().classes('w-full max-w-3xl grow hidden')
        chat_box = ui.column().classes('w-full gap-4 p-4')

        with ui.row().classes('w-full max-w-2xl p-4'):
            user_input = ui.input(placeholder="Ask anything...").classes('grow')

            def send():
                asyncio.create_task(chat())

            user_input.on('keydown.enter', lambda e: send())
            ui.button(icon='send', on_click=send)

    async def chat():
        msg = (user_input.value or "").strip()
        if not msg:
            return

        hero.visible = False
        chat_scroll.classes(remove='hidden')

        user_input.value = ""
        user_input.update()

        with chat_box:
            ui.label(msg).classes('bubble-user')

            with ui.column().classes('bubble-ai') as res:
                ui.label("...")

        full = ""

        for chunk in sva_brain.generate_stream(msg):

            # 🎨 IMAGE HANDLING
            if chunk.startswith("__IMAGE__:"):
                poll, fallback = chunk.replace("__IMAGE__:", "").split("|")

                res.clear()
                with res:
                    img = ui.image(poll).classes("w-96 rounded-lg")

                # fallback if fails
                await asyncio.sleep(2)

                img.source = poll + "?t=" + str(asyncio.get_event_loop().time())
                img.update()

                await asyncio.sleep(2)

                # if still blank → fallback
                img.source = fallback
                img.update()

                return

            full += chunk

            res.clear()
            with res:
                ui.markdown(full)

            chat_scroll.scroll_to(percent=1.0)
            await asyncio.sleep(0.01)


ui.run(port=8080)