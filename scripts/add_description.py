import csv
import json
import pandas as pd
from google import genai
from google.genai import types
import ast
import sys
import os


"""
    Este script lee la info en species.txt para crear la base de datos con la informacion necesaria
    para la base de datos sobre datos de las especies y crea el archivo species_db listo para subirlo a supabase
"""

# 1. Configurar cliente de Gemini
# Lee la clave de las variables de entorno del sistema operativo
gemini_api_key = os.environ.get("GEMINI_API_KEY")

if not gemini_api_key:
    print("Error: No se encontró la variable de entorno GEMINI_API_KEY.")
    print("Por favor, configúrala en tu sistema antes de ejecutar el script.")
    sys.exit(1)

# Inicializas el cliente normalmente
client = genai.Client(api_key=gemini_api_key)

with open('species.txt', 'r', encoding='utf-8') as archivo:
    contenido = archivo.read().strip()

# Convierte el texto con formato { 'a', 'b' } en un set real y lo pasa a lista ordenada
lista_total_especies = sorted(list(ast.literal_eval(contenido)))

print(f"Se cargaron {len(lista_total_especies)} especies correctamente.")

def dividir_en_lotes(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def completar_csv_faltante(archivo_csv="species_db.csv"):
    # Leemos el CSV existente con pandas
    df_existente = pd.read_csv(archivo_csv)
    
    # Extraemos los nombres científicos ya procesados (normalizados para evitar falsos negativos)
    procesados = set(df_existente['scientific_name'].str.strip())
    
    # Calculamos el último ID registrado para seguir la secuencia
    ultimo_id = int(df_existente['id'].max()) if not df_existente.empty else 0
    id_contador = ultimo_id + 1
    
    # Hacemos la resta de conjuntos: Total - Ya procesados = Faltantes
    # (Comparamos en minúsculas por seguridad, pero conservamos el nombre original)
    procesados_lower = {nombre.lower() for nombre in procesados}
    especies_faltantes = sorted([
        esp for esp in lista_total_especies 
        if esp.strip().lower() not in procesados_lower
    ])
    
    print(f"Total original: {len(lista_total_especies)} especies.")
    print(f"Ya procesadas en CSV: {len(procesados)} especies.")
    print(f"Faltan por procesar: {len(especies_faltantes)} especies.")
    
    if not especies_faltantes:
        print("¡Ya tienes todas las especies procesadas! No hay nada pendiente.")
        return

    # Dividimos las faltantes en lotes de 15
    lotes = list(dividir_en_lotes(especies_faltantes, 15))
    nuevos_registros = []
    
    for idx, lote in enumerate(lotes):
        print(f"Procesando lote faltante {idx + 1} de {len(lotes)}...")
        
        prompt = f"""
        Actúa como un botánico y experto en arbolado urbano. 
        Para cada una de las siguientes especies científicas, genera un objeto JSON con exactamente estos campos:
        - common_name (nombre común en inglés o español estandarizado)
        - scientific_name (el nombre científico provisto)
        - tree_count (asigna un número entero estimado y realista entre 50 y 1500)
        - care (cuidados específicos breves)
        - benefits (beneficios urbanos o ecológicos)
        - cons (inconvenientes o problemas en ciudad)
        - is_allergenic (booleano: true o false)
        - allergy_notes (detalles de alergia si aplica)
        - history (breve reseña de su introducción o hábitat)

        Lista de especies a procesar:
        {json.dumps(lote, ensure_ascii=False)}

        Devuelve ÚNICAMENTE un array JSON válido que contenga estos objetos, sin texto adicional.
        """

        try:
            response = client.models.generate_content(
                model='gemini-3.8-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                ),
            )
            
            datos_lote = json.loads(response.text)
            for item in datos_lote:
                item["id"] = id_contador
                nuevos_registros.append(item)
                id_contador += 1
                
        except Exception as e:
            print(f"Error en lote {idx + 1}: {e}")

    # Anexamos los nuevos registros al final del CSV existente (mode="a" de append)
    if nuevos_registros:
        fieldnames = [
            "id", "common_name", "scientific_name", "tree_count", 
            "care", "benefits", "cons", "is_allergenic", "allergy_notes", "history"
        ]
        
        with open(archivo_csv, mode="a", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            # NO escribimos header porque ya existe en el archivo
            for row in nuevos_registros:
                writer.writerow(row)
                
        print(f"¡Éxito! Se agregaron {len(nuevos_registros)} especies nuevas a '{archivo_csv}'.")

if __name__ == "__main__":
    completar_csv_faltante()