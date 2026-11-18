# In-engine example information

Runnable examples and CLI templates leave their HTML body to the module entry script.
Screen/ScreenUI own the game canvases; Draw, HUDFrame, InfoPanel, UIWindow and the other
engine UI classes draw gameplay information, controls, help and chat. CSS only handles
the page background, canvas fitting and touch behavior.

The remaining HTML instruction blocks in Platformer Building Blocks and Addon Building
Blocks were moved into their engine HUDs. The two CLI templates no longer use a DOM
loading/status label: their first levels draw the title and instructions. The 3D starter
selects 2d + 3d and uses Level3D's existing ScreenUI service for this overlay.

InfoPanel is exported from gameforgejs/2d. Construct it with an existing Draw helper,
a title, lines and a rectangle. The owning level maps HELP through ActionManager,
calls Toggle on the action edge and draws it in OnGUI. InfoPanel creates no canvas,
listener or loop. The world continues updating while these informational panels are open.

Platformer help uses H/Select; Renderer Showcase and Solar System use H/Start. Their
bindings live in config/game.config.json. Addon Building Blocks is passive and displays
its state and layer speeds without requiring input.

The project gate rejects HTML body information in all catalog examples and templates.
Browser tests verify that runnable bodies contain only script/canvas elements and
that help opens via keyboard and standard gamepad and visibly changes the UI canvas.
The presentation website and example browser remain ordinary accessible web pages.
