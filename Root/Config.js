export class Config {
    static data = null;

    // Busca o arquivo JSON e salva na memória
    static async Load(filepath) {
        try {
            const response = await fetch(filepath);
            if (!response.ok) throw new Error("Arquivo de configuração não encontrado!");
            
            this.data = await response.json();
            return this.data;
        } catch (error) {
            console.error("GameForgeJS: Falha Crítica ao carregar configuração.", error);
        }
    }
}