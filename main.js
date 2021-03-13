const { resolve, base, basename } = require('path')
const { app, Tray, Menu, dialog, nativeImage } = require('electron');
const Store = require('electron-store');
const { spawn } = require('cross-spawn');

const Sentry = require('@sentry/electron');
const fixPath = require('fix-path');
const fs = require('fs');


fixPath();

// Sentry.init({ dsn: "https://fee20a99f2fe44428e2f11c7654ec87a@o551235.ingest.sentry.io/5674477" });


const schema = {
    projects: {
        type: 'string',
    },
};

let mainTray = {};

if (app.dock) {
    app.dock.hide();
}

const store = new Store({ schema })

function getLocale() {
    const locale = app.getLocale();

    switch (locale) {
        case 'es-419' || 'es':
            return JSON.parse(fs.readFileSync(resolve(__dirname, 'locale/es.json')));
        case 'pt-BR' || 'pt-PT':
            return JSON.parse(fs.readFileSync(resolve(__dirname, 'locale/pt.json')));
        default:
            return JSON.parse(fs.readFileSync(resolve(__dirname, 'locale/en.json')));
    }
}

function render(tray = mainTray) {
    const storedProjects = store.get('projects');
    const projects = storedProjects ? JSON.parse(storedProjects) : [];
    const locale = getLocale();

    const items = projects.map(({ name, path }) => ({
        label: name,
        submenu: [{
                label: locale.open,
                click: () => {
                    spawn('code', [path], { shell: true });
                },
            },
            {
                label: locale.remove,
                click: () => {
                    store.set('projects', JSON.stringify(projects.filter(item => item.path !== path)));
                    render();
                },
            },
        ],
    }));

    const contextMenu = Menu.buildFromTemplate([{
            label: 'Visual Studio Code',
            icon: nativeImage.createFromPath(__dirname + '/assets/iconTemplate.png').resize({ width: 16 }),
        },
        {
            label: locale.add,
            click: () => {
                const result = dialog.showOpenDialog({ properties: ['openDirectory'] });

                if (!result) return;

                const [path] = result;
                const name = basename(path);

                store.set(
                    'projects',
                    JSON.stringify([
                        ...projects,
                        {
                            path,
                            name,
                        },
                    ]),
                );

                render();
            },
        },
        {
            type: 'separator',
        },
        ...items,
        {
            type: 'separator',
        },
        {
            type: 'normal',
            label: locale.close,
            role: 'quit',
            enabled: true,
        },
    ]);

    tray.setContextMenu(contextMenu);

    tray.on('click', tray.popUpContextMenu);
}


app.whenReady().then(() => {
    // store.clear();
    mainTray = new Tray('assets/iconTemplate.png');

    render(mainTray);
})