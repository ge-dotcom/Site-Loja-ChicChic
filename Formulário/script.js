const supabaseUrl = 'https://vgnittdaqitunmdfuyhq.supabase.co'; // Endereço do projeto no supabase. Identifica qual banco de dados você quer acessar
const supabaseChave = 'sb_publishable_hfRuXyxZbqLQrp2IqecaRA_d5Ys_H-z'; // Chave de acesso ao banco de dados. Identifica quem está acessando o banco de dados
const tableName = 'formulario'; // ajuste aqui se a tabela no Supabase tiver outro nome

function createSupabaseClient() {
    if (typeof createClient === 'function') {
        console.log('Usando createClient global');
        return createClient(supabaseUrl, supabaseChave);
    }
    if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
        console.log('Usando supabase.createClient');
        return supabase.createClient(supabaseUrl, supabaseChave);
    }
    return null;
}

const supabaseUsuario = createSupabaseClient();
if (!supabaseUsuario) {
    console.error('Cliente Supabase não encontrado. Verifique se o script CDN foi carregado antes de `script.js`.');
} else {
    const formulario = document.querySelector('#formulario'); // Seleciona o formulário HTML com o ID 'formulario'

    if (!formulario) {
        console.error('Formulário não encontrado: #formulario');
    } else {
        formulario.addEventListener('submit', async function (event){ // Adiciona um ouvinte de evento para o envio do formulário
            event.preventDefault(); // Impede o envio padrão do formulário

            const nomeEl = document.querySelector('#nome');
            const emailEl = document.querySelector('#email');
            const telefoneEl = document.querySelector('#telefone');

            const nome = nomeEl ? nomeEl.value : '';
            const email = emailEl ? emailEl.value : '';
            const telefone = telefoneEl ? telefoneEl.value : '';

            const mensagemEl = document.querySelector('#mensagem');
            const mensagem = mensagemEl ? mensagemEl.value : null; // pode ser opcional no HTML

            const data = { nome, email, telefone };
            if (mensagem !== null) data.mensagem = mensagem;

            const feedback = document.querySelector('#feedback'); // elemento opcional para mostrar mensagens ao usuário

            try {
                console.log('Enviando para tabela', tableName, 'dados:', data);
                const { data: inserted, error } = await supabaseUsuario.from(tableName).insert([data]).select(); // Insere e retorna os dados inseridos
                console.log('Dados inseridos:', inserted, 'Erro:', error);

                if (error) {
                    console.error('Erro ao enviar o formulário:', error);
                    if (feedback) {
                        feedback.style.color = 'red';
                        feedback.textContent = 'Erro: ' + (error.message || JSON.stringify(error));
                    } else {
                        alert('Erro: ' + (error.message || JSON.stringify(error)));
                    }
                    return;
                }

                if (!inserted || inserted.length === 0) {
                    console.warn('Nenhum registro retornado após insert. Verifique políticas RLS ou nome da tabela.');
                    if (feedback) {
                        feedback.style.color = 'orange';
                        feedback.textContent = 'Inserção concluída, mas nenhum registro retornado. Verifique RLS/políticas.';
                    }
                } else {
                    if (feedback) {
                        feedback.style.color = 'green';
                        feedback.textContent = 'Formulário enviado com sucesso! (ID: ' + (inserted[0].id || '—') + ')';
                    } else {
                        alert('Formulário enviado com sucesso!');
                    }
                }

                formulario.reset(); // Reseta o formulário, limpando todos os campos de entrada
            } catch (err) {
                console.error('Exceção ao enviar dados:', err);
                if (feedback) {
                    feedback.style.color = 'red';
                    feedback.textContent = 'Exceção: ' + (err.message || JSON.stringify(err));
                } else {
                    alert('Exceção: ' + (err.message || JSON.stringify(err)));
                }
            }
        });
    }
}