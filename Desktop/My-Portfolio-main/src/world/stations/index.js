import { projects } from '../../data/content'
import { Hero } from './Hero'
import { Intent } from './Intent'
import { About } from './About'
import { Toolbox } from './Toolbox'
import { Project } from './Project'
import { Journey } from './Journey'
import { Contact } from './Contact'
import { Finale } from './Finale'

// The flight plan: stations sit ~58 units apart along a gently weaving path, each one
// turned to face the camera arriving from the last. Order matches src/data/chapters.js.
export function createStations(world) {
  const at = (i, x, y, yaw) => ({ origin: [x, y, -58 * i], yaw })
  return [
    new Hero(world, { id: 'home', ...at(0, 0, 0, 0) }),
    new Intent(world, { id: 'intent', ...at(1, 9, 2, -0.18) }),
    new About(world, { id: 'about', ...at(2, -6, -1, 0.16) }),
    new Toolbox(world, { id: 'toolbox', ...at(3, 7, 1.5, -0.14) }),
    ...projects.map(
      (project, i) =>
        new Project(world, {
          id: project.id,
          project,
          index: i,
          total: projects.length,
          number: 5 + i,
          side: i % 2 ? 'left' : 'right',
          ...at(4 + i, i % 2 ? 6 : -8, i % 2 ? -1 : 0.5, i % 2 ? -0.16 : 0.2),
        }),
    ),
    new Journey(world, { id: 'journey', ...at(7, 5, 0, -0.12) }),
    new Contact(world, { id: 'contact', ...at(8, -4, 1.5, 0.1) }),
    new Finale(world, { id: 'fin', ...at(9, 0, 0, 0) }),
  ]
}
