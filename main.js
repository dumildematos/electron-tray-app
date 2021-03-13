const { resolve, base, basename } = require('path')
const { app, Tray, Menu, dialog } = require('electron');
const Store = require('electron-store');

const schema = {
    projects: {
        type: 'string'
    }
}

const store = new Store({ schema })

app.whenReady().then(() => {

    appIcon = new Tray('assets/iconTemplate.png');
    const storedProjects = store.get('projects');
    const projects = storedProjects ? JSON.parse(storedProjects) : [];

    console.log(projects)

    const contextMenu = Menu.buildFromTemplate([{
        label: 'Abrir',
        type: 'radio',
        checked: true,
        click: () => {
            const [path] = dialog.showOpenDialogSync({ properties: ['openDirectory'] })
            store.set('projects', JSON.stringify([...projects, { path, name: basename(path) }]))
        }
    }, {
        label: 'Fechar',
        click: () => {
            app.exit();
        }
    }])

    // Make a change to the context menu

    // Call this again for Linux because we modified the context menu

    appIcon.setContextMenu(contextMenu)
        // store.clear();
})