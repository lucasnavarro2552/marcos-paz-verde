import csv

"""Este script lee el csv entero de tree_data.csv y crea un archivo .txt con un set de python
que contine los nombres de todas las especies sin duplicados, para luego usar ese txt
con add_description.py para conseguir la descripcion de las especies y crear la base de datos
con dicha informacion.
"""

def extraer_columna(ruta_archivo, nombre_columna):
    """
    Extrae los valores de una columna específica de un archivo CSV y devuelve un set sin duplicados.
    """
    datos_columna = []
    try:
        with open(ruta_archivo, mode='r', encoding='utf-8') as archivo:
            lector = csv.DictReader(archivo)
            
            if nombre_columna not in lector.fieldnames:
                print(f"Error: La columna '{nombre_columna}' no existe en el archivo.")
                print(f"Columnas disponibles: {list(lector.fieldnames)}")
                return set()
            
            for fila in lector:
                valor = fila[nombre_columna].strip()
                if valor:  # Evita guardar celdas vacías
                    datos_columna.append(valor)
                
    except FileNotFoundError:
        print(f"Error: No se encontró el archivo en la ruta '{ruta_archivo}'.")
    except Exception as e:
        print(f"Ocurrió un error inesperado: {e}")
        
    return set(datos_columna)

# ==========================================
# Ejemplo de uso:
# ==========================================
if __name__ == "__main__":
    archivo = "tree_data.csv"
    columna = "nombre_cientifico"
    archivo_salida = "species.txt"
    
    resultado = extraer_columna(archivo, columna)
    
    if resultado:
        with open(archivo_salida, mode='w', encoding='utf-8') as f:
            f.write(repr(resultado))
            
        print(f"Se guardaron {len(resultado)} especies únicas en '{archivo_salida}'.")
    else:
        print("No se extrajeron datos para guardar.")