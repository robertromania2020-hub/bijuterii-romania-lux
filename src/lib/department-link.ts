/** Rutele de departament disponibile în magazin. */
export const DEPARTMENT_PATHS = {
  bijuterii: "/bijuterii",
  machiaj: "/machiaj",
  ceasuri: "/ceasuri",
  parfumuri: "/parfumuri",
} as const;

export type DepartmentPath = (typeof DEPARTMENT_PATHS)[keyof typeof DEPARTMENT_PATHS];

/** Calea către pagina unui departament; implicit, catalogul complet. */
export function departmentPath(slug: string): DepartmentPath | "/produse" {
  return DEPARTMENT_PATHS[slug as keyof typeof DEPARTMENT_PATHS] ?? "/produse";
}
