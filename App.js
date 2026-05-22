import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { isRunningInExpoGo } from "expo";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";

const Drawer = createDrawerNavigator();

const isAndroidExpoGo = Platform.OS === "android" && isRunningInExpoGo();
let notificationsModulePromise = null;

async function loadNotificationsModule() {
  if (isAndroidExpoGo) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import("expo-notifications").then(
      (module) => {
        const Notifications = module.default ?? module;

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });

        return Notifications;
      },
    );
  }

  return notificationsModulePromise;
}

const prepIdeas = [
  {
    title: "Teriyaki Chicken Bowl",
    description:
      "High-protein meal prep idea using chicken, rice, and vegetables.",
  },
  {
    title: "Steak & Rice Power Bowl",
    description: "A filling meal prep idea for busy weekdays.",
  },
  {
    title: "Mediterranean Chicken Wrap",
    description: "Fresh, quick, and easy to prep ahead.",
  },
  {
    title: "Salmon Avocado Rice Bowl",
    description: "Balanced meal with protein, healthy fats, and carbs.",
  },
];

function HomeScreen({ prepIdea, showRandomPrepIdea }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>MePrep 🍴</Text>
        <Text style={styles.subtitle}>Meal Prep Assistant</Text>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Meal Prep Made Simple</Text>
        <Text style={styles.heroText}>
          Organize groceries, save recipes, build your shopping list, and
          schedule meal prep reminders.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today’s Prep Idea 🔥</Text>
        <Text style={styles.boldText}>{prepIdea.title}</Text>
        <Text style={styles.bodyText}>{prepIdea.description}</Text>
        <TouchableOpacity style={styles.button} onPress={showRandomPrepIdea}>
          <Text style={styles.buttonText}>New Idea</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>App Sections</Text>
        <Text style={styles.bodyText}>
          ☰ Open the drawer menu to access Groceries, Recipes, Shopping List,
          and Reminders.
        </Text>
      </View>
    </ScrollView>
  );
}

function GroceryScreen({
  groceries,
  groceryInput,
  setGroceryInput,
  groceryError,
  addGrocery,
  removeGrocery,
  startVoiceInput,
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Groceries in Your House</Text>
        <TextInput
          style={styles.input}
          placeholder="Type grocery item here"
          value={groceryInput}
          onChangeText={setGroceryInput}
        />
        {groceryError ? (
          <Text style={styles.errorText}>{groceryError}</Text>
        ) : null}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={addGrocery}>
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.micButton} onPress={startVoiceInput}>
            <Text style={styles.buttonText}>🎤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tagContainer}>
          {groceries.map((item, index) => (
            <View key={`${item}-${index}`} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
              <TouchableOpacity onPress={() => removeGrocery(index)}>
                <Text style={styles.removeText}> x</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function RecipesScreen({
  recipes,
  recipeName,
  setRecipeName,
  recipeIngredients,
  setRecipeIngredients,
  recipeInstructions,
  setRecipeInstructions,
  recipeError,
  recipeMessages,
  saveRecipe,
  removeRecipe,
  cookRecipe,
  startVoiceInput,
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Create Recipe</Text>
        <TextInput
          style={styles.input}
          placeholder="Recipe name"
          value={recipeName}
          onChangeText={setRecipeName}
        />
        <TextInput
          style={styles.textArea}
          placeholder="Ingredients separated by commas"
          value={recipeIngredients}
          onChangeText={setRecipeIngredients}
          multiline
        />
        <TextInput
          style={styles.textArea}
          placeholder="Instructions"
          value={recipeInstructions}
          onChangeText={setRecipeInstructions}
          multiline
        />
        {recipeError ? (
          <Text style={styles.errorText}>{recipeError}</Text>
        ) : null}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.micButton} onPress={startVoiceInput}>
            <Text style={styles.buttonText}>🎤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={saveRecipe}>
            <Text style={styles.buttonText}>Save Recipe</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Digital Recipe Cards</Text>
      {recipes.map((recipe, index) => (
        <View key={`${recipe.name}-${index}`} style={styles.card}>
          <Text style={styles.cardTitle}>{recipe.name}</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.boldText}>Ingredients: </Text>
            {recipe.ingredients}
          </Text>
          <Text style={styles.bodyText}>
            <Text style={styles.boldText}>Instructions: </Text>
            {recipe.instructions}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => cookRecipe(index)}
            >
              <Text style={styles.buttonText}>Cook Recipe</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeRecipe(index)}
            >
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
          </View>

          {recipeMessages[index] ? (
            <Text
              style={
                recipeMessages[index].includes("all ingredients")
                  ? styles.successText
                  : styles.warningText
              }
            >
              {recipeMessages[index]}
            </Text>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

function ShoppingScreen({
  shoppingItems,
  shoppingInput,
  setShoppingInput,
  shoppingError,
  addShoppingItem,
  removeShoppingItem,
  startVoiceInput,
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Grocery Shopping List</Text>
        <TextInput
          style={styles.input}
          placeholder="Add missing item"
          value={shoppingInput}
          onChangeText={setShoppingInput}
        />
        {shoppingError ? (
          <Text style={styles.errorText}>{shoppingError}</Text>
        ) : null}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={addShoppingItem}>
            <Text style={styles.buttonText}>Add to List</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.micButton} onPress={startVoiceInput}>
            <Text style={styles.buttonText}>🎤</Text>
          </TouchableOpacity>
        </View>

        {shoppingItems.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.listItem}>
            <Text style={styles.bodyText}>☐ {item}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeShoppingItem(index)}
            >
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function ReminderScreen({
  reminders,
  reminderTitle,
  setReminderTitle,
  reminderMinutes,
  setReminderMinutes,
  reminderError,
  addReminder,
  removeReminder,
  notificationsEnabled,
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Meal Prep Reminders 📅</Text>
        <Text style={styles.bodyText}>
          Schedule a reminder for meal prep. Example: remind me in 30 minutes.
        </Text>
        {!notificationsEnabled ? (
          <Text style={styles.warningText}>
            Notifications are unavailable in Android Expo Go. Use a
            development build to schedule reminders on Android.
          </Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Reminder title"
          value={reminderTitle}
          onChangeText={setReminderTitle}
        />

        <TextInput
          style={styles.input}
          placeholder="Minutes from now, example: 30"
          value={reminderMinutes}
          onChangeText={setReminderMinutes}
          keyboardType="numeric"
        />

        {reminderError ? (
          <Text style={styles.errorText}>{reminderError}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, !notificationsEnabled && styles.disabledButton]}
          onPress={addReminder}
          disabled={!notificationsEnabled}
        >
          <Text style={styles.buttonText}>Schedule Reminder</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Saved Reminders</Text>
        {reminders.length === 0 ? (
          <Text style={styles.bodyText}>No reminders scheduled yet.</Text>
        ) : (
          reminders.map((reminder, index) => (
            <View key={`${reminder.title}-${index}`} style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.boldText}>{reminder.title}</Text>
                <Text style={styles.bodyText}>
                  In {reminder.minutes} minute(s)
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeReminder(index)}
              >
                <Text style={styles.buttonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function FutureScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Future Features</Text>
        <Text style={styles.bodyText}>🔔 Expiration Alerts</Text>
        <Text style={styles.bodyText}>🧾 Receipt Scanner</Text>
        <Text style={styles.bodyText}>🛒 Store Sale API</Text>
        <Text style={styles.bodyText}>🥗 Nutrition Tracking</Text>
      </View>
    </ScrollView>
  );
}

export default function App() {
  const [prepIdea, setPrepIdea] = useState(prepIdeas[0]);
  const [groceries, setGroceries] = useState([
    "Eggs",
    "Milk",
    "Chicken",
    "Rice",
    "Spinach",
  ]);
  const [shoppingItems, setShoppingItems] = useState([
    "Bread",
    "Cheese",
    "Apples",
  ]);
  const [recipes, setRecipes] = useState([
    {
      name: "Chicken Alfredo",
      ingredients: "Chicken, pasta, parmesan, cream",
      instructions: "Cook pasta, grill chicken, mix sauce, and combine.",
    },
    {
      name: "Veggie Rice Bowl",
      ingredients: "Rice, spinach, carrots, eggs",
      instructions: "Cook rice, sauté vegetables, and top with egg.",
    },
  ]);

  const [reminders, setReminders] = useState([]);
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState("");
  const [reminderError, setReminderError] = useState("");

  const [groceryInput, setGroceryInput] = useState("");
  const [shoppingInput, setShoppingInput] = useState("");
  const [recipeName, setRecipeName] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState("");
  const [recipeInstructions, setRecipeInstructions] = useState("");
  const [recipeMessages, setRecipeMessages] = useState({});

  const [groceryError, setGroceryError] = useState("");
  const [shoppingError, setShoppingError] = useState("");
  const [recipeError, setRecipeError] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    !isAndroidExpoGo,
  );

  useEffect(() => {
    loadSavedData();
    showRandomPrepIdea();
    initializeNotifications();
  }, []);

  useEffect(() => {
    saveData();
  }, [groceries, shoppingItems, recipes, reminders]);

  async function initializeNotifications() {
    try {
      const Notifications = await loadNotificationsModule();

      if (!Notifications) {
        setNotificationsEnabled(false);
        return;
      }

      const { status } = await Notifications.getPermissionsAsync();

      if (status !== "granted") {
        const permissionResult = await Notifications.requestPermissionsAsync();
        if (permissionResult.status !== "granted") {
          Alert.alert(
            "Notifications Disabled",
            "Enable notifications to receive meal prep reminders.",
          );
          setNotificationsEnabled(false);
          return;
        }
      }

      setNotificationsEnabled(true);
    } catch (error) {
      console.log("Error initializing notifications:", error);
      setNotificationsEnabled(false);
    }
  }

  async function loadSavedData() {
    try {
      const savedGroceries = await AsyncStorage.getItem("meprepGroceries");
      const savedShoppingItems = await AsyncStorage.getItem(
        "meprepShoppingItems",
      );
      const savedRecipes = await AsyncStorage.getItem("meprepRecipes");
      const savedReminders = await AsyncStorage.getItem("meprepReminders");

      if (savedGroceries) setGroceries(JSON.parse(savedGroceries));
      if (savedShoppingItems) setShoppingItems(JSON.parse(savedShoppingItems));
      if (savedRecipes) setRecipes(JSON.parse(savedRecipes));
      if (savedReminders) setReminders(JSON.parse(savedReminders));
    } catch (error) {
      console.log("Error loading saved data:", error);
    }
  }

  async function saveData() {
    try {
      await AsyncStorage.setItem("meprepGroceries", JSON.stringify(groceries));
      await AsyncStorage.setItem(
        "meprepShoppingItems",
        JSON.stringify(shoppingItems),
      );
      await AsyncStorage.setItem("meprepRecipes", JSON.stringify(recipes));
      await AsyncStorage.setItem("meprepReminders", JSON.stringify(reminders));
    } catch (error) {
      console.log("Error saving data:", error);
    }
  }

  function showRandomPrepIdea() {
    const randomPrep = prepIdeas[Math.floor(Math.random() * prepIdeas.length)];
    setPrepIdea(randomPrep);
  }

  function addGrocery() {
    const item = groceryInput.trim();
    setGroceryError("");

    if (item === "") {
      setGroceryError("Please enter a grocery item.");
      return;
    }

    setGroceries([...groceries, item]);
    setGroceryInput("");
  }

  function removeGrocery(index) {
    setGroceries(groceries.filter((_, itemIndex) => itemIndex !== index));
  }

  function addShoppingItem() {
    const item = shoppingInput.trim();
    setShoppingError("");

    if (item === "") {
      setShoppingError("Please enter a shopping item.");
      return;
    }

    setShoppingItems([...shoppingItems, item]);
    setShoppingInput("");
  }

  function removeShoppingItem(index) {
    setShoppingItems(
      shoppingItems.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function saveRecipe() {
    setRecipeError("");

    if (
      recipeName.trim() === "" ||
      recipeIngredients.trim() === "" ||
      recipeInstructions.trim() === ""
    ) {
      setRecipeError(
        "Please fill in the recipe name, ingredients, and instructions.",
      );
      return;
    }

    const newRecipe = {
      name: recipeName.trim(),
      ingredients: recipeIngredients.trim(),
      instructions: recipeInstructions.trim(),
    };

    setRecipes([...recipes, newRecipe]);
    setRecipeName("");
    setRecipeIngredients("");
    setRecipeInstructions("");
  }

  function removeRecipe(index) {
    setRecipes(recipes.filter((_, recipeIndex) => recipeIndex !== index));
  }

  function cleanItem(item) {
    return item.trim().toLowerCase();
  }

  function getRecipeIngredients(recipe) {
    return recipe.ingredients
      .split(",")
      .map((ingredient) => ingredient.trim())
      .filter((ingredient) => ingredient !== "");
  }

  function cookRecipe(index) {
    const recipe = recipes[index];
    const recipeIngredientsList = getRecipeIngredients(recipe);
    const groceryItems = groceries.map(cleanItem);
    const shoppingListItems = shoppingItems.map(cleanItem);

    const missingIngredients = recipeIngredientsList.filter((ingredient) => {
      return !groceryItems.includes(cleanItem(ingredient));
    });

    const newShoppingItems = [...shoppingItems];

    missingIngredients.forEach((ingredient) => {
      if (!shoppingListItems.includes(cleanItem(ingredient))) {
        newShoppingItems.push(ingredient);
      }
    });

    setShoppingItems(newShoppingItems);

    setRecipeMessages({
      ...recipeMessages,
      [index]:
        missingIngredients.length === 0
          ? "You have all ingredients for this recipe."
          : `Missing ingredients added to shopping list: ${missingIngredients.join(", ")}`,
    });
  }

  async function addReminder() {
    const title = reminderTitle.trim();
    const minutes = Number(reminderMinutes);
    setReminderError("");

    if (title === "" || reminderMinutes.trim() === "") {
      setReminderError("Please enter a reminder title and minutes.");
      return;
    }

    if (Number.isNaN(minutes) || minutes <= 0) {
      setReminderError("Please enter a valid number of minutes.");
      return;
    }

    try {
      const Notifications = await loadNotificationsModule();

      if (!Notifications) {
        Alert.alert(
          "Reminder Unavailable",
          "Android Expo Go cannot schedule reminders. Use a development build to enable notifications.",
        );
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "MePrep Reminder 🍴",
          body: title,
        },
        trigger: {
          seconds: minutes * 60,
        },
      });
    } catch (error) {
      console.log("Error scheduling reminder:", error);
      Alert.alert(
        "Reminder Unavailable",
        "Unable to schedule this reminder right now.",
      );
      return;
    }

    setReminders([...reminders, { title, minutes }]);
    setReminderTitle("");
    setReminderMinutes("");
    Alert.alert(
      "Reminder Scheduled",
      `MePrep will remind you in ${minutes} minute(s).`,
    );
  }

  function removeReminder(index) {
    setReminders(
      reminders.filter((_, reminderIndex) => reminderIndex !== index),
    );
  }

  function startVoiceInput() {
    Alert.alert(
      "Voice Input Note",
      "The browser Web Speech API does not work directly in React Native. To add real voice input, use a speech-to-text React Native package.",
    );
  }

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: "#3A7D44" },
          headerTintColor: "#ffffff",
          drawerActiveTintColor: "#3A7D44",
          drawerLabelStyle: { fontWeight: "bold" },
        }}
      >
        <Drawer.Screen name="Home">
          {() => (
            <HomeScreen
              prepIdea={prepIdea}
              showRandomPrepIdea={showRandomPrepIdea}
            />
          )}
        </Drawer.Screen>

        <Drawer.Screen name="Groceries">
          {() => (
            <GroceryScreen
              groceries={groceries}
              groceryInput={groceryInput}
              setGroceryInput={setGroceryInput}
              groceryError={groceryError}
              addGrocery={addGrocery}
              removeGrocery={removeGrocery}
              startVoiceInput={startVoiceInput}
            />
          )}
        </Drawer.Screen>

        <Drawer.Screen name="Recipes">
          {() => (
            <RecipesScreen
              recipes={recipes}
              recipeName={recipeName}
              setRecipeName={setRecipeName}
              recipeIngredients={recipeIngredients}
              setRecipeIngredients={setRecipeIngredients}
              recipeInstructions={recipeInstructions}
              setRecipeInstructions={setRecipeInstructions}
              recipeError={recipeError}
              recipeMessages={recipeMessages}
              saveRecipe={saveRecipe}
              removeRecipe={removeRecipe}
              cookRecipe={cookRecipe}
              startVoiceInput={startVoiceInput}
            />
          )}
        </Drawer.Screen>

        <Drawer.Screen name="Shopping List">
          {() => (
            <ShoppingScreen
              shoppingItems={shoppingItems}
              shoppingInput={shoppingInput}
              setShoppingInput={setShoppingInput}
              shoppingError={shoppingError}
              addShoppingItem={addShoppingItem}
              removeShoppingItem={removeShoppingItem}
              startVoiceInput={startVoiceInput}
            />
          )}
        </Drawer.Screen>

        <Drawer.Screen name="Reminders">
          {() => (
            <ReminderScreen
              reminders={reminders}
              reminderTitle={reminderTitle}
              setReminderTitle={setReminderTitle}
              reminderMinutes={reminderMinutes}
              setReminderMinutes={setReminderMinutes}
              reminderError={reminderError}
              addReminder={addReminder}
              removeReminder={removeReminder}
              notificationsEnabled={notificationsEnabled}
            />
          )}
        </Drawer.Screen>

        <Drawer.Screen name="Future Features" component={FutureScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    paddingTop: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#3A7D44",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#222831",
    marginBottom: 10,
  },
  heroText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222831",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3A7D44",
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 8,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: "bold",
    color: "#222831",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    marginBottom: 8,
    fontSize: 15,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#3A7D44",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  micButton: {
    backgroundColor: "#F4A261",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  removeButton: {
    backgroundColor: "#8B5E3C",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  tag: {
    backgroundColor: "#eef3ef",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: {
    color: "#2f5d35",
    fontWeight: "bold",
  },
  removeText: {
    color: "#2f5d35",
    fontWeight: "bold",
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    color: "#d62828",
    fontSize: 14,
    marginBottom: 8,
  },
  warningText: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#fff3e0",
    color: "#7a4b00",
    fontSize: 14,
  },
  successText: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#eef3ef",
    color: "#2f5d35",
    fontSize: 14,
  },
});
