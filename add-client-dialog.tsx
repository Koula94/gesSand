const onSubmit = async (data: FormData) => {
  try {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create client');
    }

    const result = await response.json();
    // Handle successful creation
    
  } catch (error) {
    console.error('Error creating client:', error);
    // Handle error appropriately
  }
}; 