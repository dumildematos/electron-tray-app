const { resolve, base, basename } = require('path')
const { app, Tray, Menu, dialog, MenuItem } = require('electron');
const Store = require('electron-store');
const { spawn } = require('cross-spawn');

const schema = {
    projects: {
        type: 'string'
    }
}

const store = new Store({ schema })

app.whenReady().then(() => {
    // store.clear();
    appIcon = new Tray('assets/iconTemplate.png');
    const storedProjects = store.get('projects');
    const projects = storedProjects ? JSON.parse(storedProjects) : [];

    const items = projects.map((project) => {
        return {
            label: project.name,
            click: () => {
                spawn.sync('code', [project.path])
            }
        }
    })

    const contextMenu = Menu.buildFromTemplate([{
            type: 'separator'
        }, {
            label: 'Local',
            submenu: [...items]
        },
        {
            label: 'Remotos',
            submenu: []
        },
        {
            type: 'separator'
        },
        {
            label: 'Configuração'
        },
        {
            label: 'Fechar',
            click: () => {
                app.exit();
            }
        }
    ])

    contextMenu.insert(0, new MenuItem({
        label: 'Adicionar novo Projecto',
        click: () => {
            const [path] = dialog.showOpenDialogSync({ properties: ['openDirectory'] })
            const name = basename(path)
            store.set('projects', JSON.stringify([...projects, { path, name }]))

            const item = new MenuItem({
                label: name,
                click: () => {
                    spawn.sync('code', [path])

                }
            })

            contextMenu.append(item)

        }
    }))

    // Make a change to the context menu

    // Call this again for Linux because we modified the context menu

    appIcon.setContextMenu(contextMenu)
        // store.clear();
})