import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;


public class Server extends Thread {
	
    private Socket conexao;

    
    public Server(Socket socket) {
        this.conexao = socket;
    }
   
  
    public static void main(String args[]) {
        try {
            ServerSocket server = new ServerSocket(1234);
            System.out.println("Servidor utilizando a porta 1234");
           
            while (true) {
                Socket conexao = server.accept();
                Thread t = new Server(conexao);
                t.start();
            }
        } catch (IOException e) {
        	e.printStackTrace();
        }
    }
    
    public void run()
    {	try {
    		BufferedReader entrada = new BufferedReader(new InputStreamReader(this.conexao.getInputStream()));            
			PrintStream saida = new PrintStream(this.conexao.getOutputStream());
				
			String JSON = entrada.readLine();
			
			while(JSON != null && !(JSON.trim().equals("")))
            {
				//Envio do JSON para o notify
				HttpClient notify = HttpClient.newHttpClient();
				
				HttpRequest pedido = HttpRequest.newBuilder()
						.POST(HttpRequest.BodyPublishers.ofString(JSON))
						.timeout(Duration.ofSeconds(10))
						.uri(URI.create("/notify"))
						.build();
				
				notify.sendAsync(pedido, HttpResponse.BodyHandlers.ofString())
				      .thenApply(HttpResponse::body)
				      .thenAccept(System.out::println)
				      .join();
				
				//Envio do JSON para o busca
				HttpClient busca = HttpClient.newHttpClient();
				
				HttpRequest pedido2 = HttpRequest.newBuilder()
						.POST(HttpRequest.BodyPublishers.ofString(JSON))
						.timeout(Duration.ofSeconds(10))
						.uri(URI.create("/busca"))
						.build();
				
				busca.sendAsync(pedido2, HttpResponse.BodyHandlers.ofString())
				      .thenApply(HttpResponse::body)
				      .thenAccept(System.out::println)
				      .join();
				
				JSON = entrada.readLine();
            }
				
		} catch (IOException e) {
			e.printStackTrace();
		}
		
    }
}
