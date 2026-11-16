import time
import pandas as pd

"""
    Este script toma la informacion de species_db.csv y tree_data.csv y crea un nuevo archivo tree_data_pk_fj.csv
    con la misma inforamcion de tree_data.csv pero anadiendo 2 columnas, una para un id entero y autoincremental
    y otra que funciona como FK que es el id de la especie tomada de species_db.csv, el archivo csv queda listo
    para subir a supabase y crear la pk y fk correspondientes, con la relacion a la tabla species_db.csv
"""

inicio = time.time()

print("1. Cargando la base de especies...")
df_especies = pd.read_csv("species_db.csv")

# --- PEGA DESDE AQUÍ ---
# Normalizamos la columna de nombres en especies_bd.csv
df_especies['nombre_clave'] = (
    df_especies['scientific_name']
    .astype(str)
    .str.strip()
    .str.replace(r'\s+', ' ', regex=True)
    .str.lower()
)

# Creamos el diccionario de mapeo {nombre_clave: id}
mapa_especies = dict(zip(df_especies['nombre_clave'], df_especies['id']))
print(f"   -> {len(mapa_especies)} especies cargadas en el mapa.")

print("2. Cargando el archivo grande de árboles de CABA...")
df_arboles = pd.read_csv("tree_data.csv", low_memory=False)
print(f"   -> {len(df_arboles)} árboles cargados.")

print("3. Asignando la Foreign Key (especie_id)...")
# Normalizamos la columna de nombres en el CSV grande de CABA
# (Esto convierte "Salix  viminalis" en "salix viminalis" automáticamente)
df_arboles['nombre_clave'] = (
    df_arboles['nombre_cientifico']
    .astype(str)
    .str.strip()
    .str.replace(r'\s+', ' ', regex=True)
    .str.lower()
)

# Corregimos el error de tipeo de CABA ("Livistrona" -> "Livistona")
correcciones = {
    "livistrona australis": "livistona australis"
}
df_arboles['nombre_clave'] = df_arboles['nombre_clave'].replace(correcciones)

# Asignamos la Foreign Key asegurando que sea entero limpio (Int64)
df_arboles['especie_id'] = df_arboles['nombre_clave'].map(mapa_especies).astype('Int64')

# Borramos la columna auxiliar antes de guardar
df_arboles.drop(columns=['nombre_clave'], inplace=True)
# --- HASTA AQUÍ ---

print("4. Generando el ID autoincremental para cada árbol...")
sin_match = df_arboles['especie_id'].isna().sum()
if sin_match > 0:
    print(f"   ⚠️ Advertencia: {sin_match} filas no encontraron coincidencia con el ID de especie.")
else:
    print("   ✅ ¡100% de los árboles conectados correctamente!")

# Insertamos el ID autoincremental al principio (columna 0) si aún no existe
if 'id' in df_arboles.columns:
    df_arboles.drop(columns=['id'], inplace=True)
df_arboles.insert(0, 'id', range(1, len(df_arboles) + 1))

print("5. Guardando el archivo final en 'tree_data_pk_fk.csv'...")
df_arboles.to_csv("tree_data_pk_fk.csv", index=False, encoding="utf-8")

fin = time.time()
print(f"¡Proceso completado con éxito en {fin - inicio:.2f} segundos!")