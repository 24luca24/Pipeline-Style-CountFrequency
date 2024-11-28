import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class TermFrequency {
    private static int LIMIT;
    public static void main(String[] args) {
    LIMIT = getLimit(args[1]);
    printAll(
        findMostFrequencyWord(
            sort(
                countFrequency(
                    removeStopWords(
                        toListWord(
                            splitIntoArray(
                                convertLowerCase(
                                    removeSingleLetters(
                                        removeNonAlpha(
                                            readFile(args[0])
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
    }

    //method to read a file
    private static String readFile(String pathToFile) {
        try {
            return Files.readString(Paths.get(pathToFile), StandardCharsets.UTF_8);
        } catch(final IOException e) {
            return null;
        }
    }

    //method to remove nonAlphaNumericWords
    private static String removeNonAlpha(String text) {
        return text.replaceAll("[\\W_]+", " ");
    }

     //method to remove single word
     private static String removeSingleLetters(String text) {
        return text.replaceAll("\\b[a-zA-Z]\\b", "").replaceAll("\\s{2,}", " ").trim();
    }

    //method to put all in lowerCase
    private static String convertLowerCase(String text) {
        return text.toLowerCase();  
    }

    //method to split the string into an array
    private static String[] splitIntoArray(String text) {
        return text.split(" ");
    }

    //converting array into a list
    private static Stream<String> toListWord(String[] arrayWord) {
        return Arrays.stream(arrayWord);
    }

    //stop word management

        //split stopWord into an array
        private static String[] splitStopWordIntoArray() {
            return readFile("stop_words.txt").split(",");
        }

        //transform stopWord into an Array 
        private static List<String> toListStopWord(String[] arrayStopWord) {
            return Arrays.asList(arrayStopWord);
        }

        //removing stopWord from the file
        private static List<String> removeStopWords(Stream<String> streamOfWord) {
            return streamOfWord
                .filter(word -> !(toListStopWord(splitStopWordIntoArray())).contains(word))
                .collect(Collectors.toUnmodifiableList());
        }

    //counting word
    private static Map<String, Integer> countFrequency(List<String> list) {
        return list.stream().collect(Collectors.groupingBy(
            word -> word, //word is the same
            Collectors.reducing(0, word -> 1, Integer::sum) //count that start from zero, and add one for each occurrence of the word
        ));
    }

    //sorting the word (entry transform the map into a set)
    private static List<Map.Entry<String, Integer>> sort(Map<String, Integer> map) {
        return map.entrySet().stream()
            .sorted((entry1, entry2) -> entry2.getValue().compareTo(entry1.getValue())) // Ordinamento decrescente
            .collect(Collectors.toList());
    }

    //extract N most frequency word
    private static List<Map.Entry<String, Integer>> findMostFrequencyWord(List<Map.Entry<String, Integer>> list) {
        return list.subList(0, Math.min(LIMIT, list.size()));
    }

    //print the results
    private static void printAll(List<Map.Entry<String, Integer>> list) {
        if (list.size() > 0) {
            System.out.println(list.get(0).getKey() + "  -  " + list.get(0).getValue());

            printAll(list.subList(1, list.size()));
        }
    }

    //get limit 
    private static int getLimit(String limit){
        return Integer.parseInt(limit);
    }
    
}
