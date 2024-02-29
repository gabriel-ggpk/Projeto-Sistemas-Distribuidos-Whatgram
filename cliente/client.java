import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.Socket;
import org.json.JSONObject;

public class Client extends Thread {
	

	private Socket conexao;
	
	private static String UserID;

	public Client(Socket socket, String userID) {
		this.conexao = socket;
		this.UserID = userID;
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
			BufferedReader teclado = new BufferedReader(new InputStreamReader(System.in));
	                  
	        Thread thread = new Client(socket,"Joao");
	        thread.start();
	        
	        while (true)
            {
                String mensagem = teclado.readLine();
                 
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
	            	System.out.println("aloha");
	                String mensagem = entrada.readLine();
	                if (mensagem == null) {
	                    System.out.println("Conex�o encerrada");
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
