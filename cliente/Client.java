import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.HttpURLConnection;
import java.net.Socket;
import java.net.URL;

import org.json.JSONObject;

public class Client extends Thread {
	
	public Socket conexao;
	
	public static String UserID;

	public Client(Socket socket) {
		this.conexao = socket;
	}

	public String getUserID() {
		return UserID;
	}

	public void setUserID(String userID) {
		UserID = userID;
	}

	public static void main(String args[])
	{	
		try {

			Socket socket = new Socket("192.168.0.16", 1234);
			PrintStream saida = new PrintStream(socket.getOutputStream());
	                  
	        Thread thread = new Client(socket);
	        thread.start();
	        
	        while (true)
            {
	        	
	        //Recebe a mensagem do front e manda essa mensagem e o nome do cliente como um JSON para o server
	        URL url = new URL("/front");
	        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
	        conn.setRequestMethod("POST");
	             
	        BufferedReader leitor = new BufferedReader(new InputStreamReader(conn.getInputStream())); 
	             
                String mensagem = leitor.readLine();
                 
                JSONObject objeto = new JSONObject();
                String usuario = UserID;
                
                objeto.put("userId", usuario);
                objeto.put("message", mensagem);
                String JSON = objeto.toString();
                
                saida.println(JSON);
            }

	    } catch (IOException e) {
	    	e.printStackTrace();
	    }
	}
	public void run()
	{
		 try {
	            BufferedReader entrada = new BufferedReader(new InputStreamReader(this.conexao.getInputStream()));
	            
	            while (true)
	            {
	                String mensagem = entrada.readLine();
	                if (mensagem == null) {
	                    System.out.println("Conexao encerrada");
	                    System.exit(0);
	                }
	                System.out.println("\n" + mensagem);
	            }
	        } 
	        	catch (IOException e) {
	        	e.printStackTrace();
	        }
	
	}
}

